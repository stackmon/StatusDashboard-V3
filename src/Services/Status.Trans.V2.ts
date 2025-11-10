import dayjs from "dayjs";
import { orderBy } from "lodash";
import { EventStatus, EventType, GetEventType, IsIncident } from "~/Components/Event/Enums";
import { Logger } from "~/Helpers/Logger";
import { EmptyDB } from "./Status";
import { IncidentEntityV2, NameEnum, StatusEntityV2, StatusEnum } from "./Status.Entities";
import { IStatusContext, Models } from "./Status.Models";

const log = new Logger("Service", "Status", "TransformerV2");

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function TransformerV2({ Components, Events }: { Components: StatusEntityV2[], Events: IncidentEntityV2[] }): IStatusContext {
  let id = 0;
  const db = EmptyDB();

  if (!Components?.length) {
    log.warn("Empty List.");
    return db;
  }

  for (const comp of Components) {
    if (!comp.attributes || comp.attributes.length < 3) {
      log.debug("Skipped Hidden Item.", comp);
      continue;
    }

    const targetCate = comp.attributes.find(
      (x) => x.name === NameEnum.Category
    )?.value;
    if (!targetCate) {
      log.debug("Skipped Null Category.", comp);
      continue;
    }

    let dbCate = db.Categories.find((x) => x.Name === targetCate);
    if (!dbCate) {
      dbCate = { Id: id++, Name: targetCate, Services: new Set() };
      db.Categories.push(dbCate);
    }

    const targetRegion = comp.attributes.find(
      (x) => x.name === NameEnum.Region
    )?.value;
    if (!targetRegion) {
      log.debug("Skipped Null Region.", comp);
      continue;
    }

    let dbRegion = db.Regions.find((x) => x.Name === targetRegion);
    if (!dbRegion) {
      dbRegion = { Id: id++, Name: targetRegion, Services: new Set() };
      db.Regions.push(dbRegion);
    }

    const targetService = comp.name;

    let dbService = db.Services.find((x) => x.Name === targetService);
    if (!dbService) {
      const abbr = comp.attributes.find(
        (x) => x.name === NameEnum.Type
      )?.value;
      if (!abbr) {
        log.debug("Skipped Null Type.", comp);
        continue;
      }

      dbService = {
        Id: id++,
        Name: targetService,
        Abbr: abbr,
        Category: dbCate,
        Regions: new Set([dbRegion]),
      };
      db.Services.push(dbService);
    }

    dbService.Regions.add(dbRegion);
    dbRegion.Services.add(dbService);
    dbCate.Services.add(dbService);

    let regionService = db.RegionService.find(
      (x) => x.Region === dbRegion && x.Service === dbService
    );
    if (!regionService) {
      regionService = {
        Id: comp.id,
        Region: dbRegion,
        Service: dbService,
        Events: new Set(),
      };
      db.RegionService.push(regionService);
    }
  }

  log.debug("Component data loaded.");

  for (const event of Events) {
    if (event.components.length < 1) {
      log.debug("Skipped Hidden Item.", event);
      continue
    }

    let type = GetEventType(event.impact);

    if (event.type === "info") {
      type = EventType.Information;
    }

    const dbEvent: Models.IEvent = {
      Id: event.id,
      Title: event.title,
      Start: dayjs(event.start_date).toDate(),
      Type: type,
      Status: IsIncident(type) ? EventStatus.Detected : EventStatus.Planned,
      Histories: new Set(),
      RegionServices: new Set(),
      Description: event.description
    };

    if (event.end_date) {
      dbEvent.End = dayjs(event.end_date).toDate();
    }

    for (const rsId of event.components) {
      const rs = db.RegionService.find((x) => x.Id === rsId);
      if (!rs) {
        log.debug("Skipped Missing RegionService.", rsId);
        continue;
      }

      dbEvent.RegionServices.add(rs);
      rs.Events.add(dbEvent);
    }

    if (dbEvent.RegionServices.size < 1) {
      log.debug("Skipped Empty RegionService.", event);
      continue;
    }

    if (event.updates?.length) {
      let prev = dbEvent.Status;

      for (const update of event.updates) {
        const status = (() => {
          switch (update.status) {
            case StatusEnum.System:
              return event.end_date
                ? IsIncident(type) ? EventStatus.Resolved : EventStatus.Completed
                : prev;

            case StatusEnum.Analyzing:
            case StatusEnum.Analysing:
              return EventStatus.Analysing;
            case StatusEnum.Detected:
              return EventStatus.Detected;
            case StatusEnum.Reopened:
              return EventStatus.Reopened;
            case StatusEnum.Fixing:
              return EventStatus.Fixing;
            case StatusEnum.Observing:
              return EventStatus.Observing;
            case StatusEnum.Resolved:
              return EventStatus.Resolved;

            case StatusEnum.Description:
              dbEvent.Description = update.text;
              break;

            case StatusEnum.Scheduled:
            case StatusEnum.Planned:
              return EventStatus.Planned;
            case StatusEnum.Active:
              return EventStatus.Active;
            case StatusEnum.Modified:
              return EventStatus.Modified;
            case StatusEnum.InProgress:
              return EventStatus.InProgress;
            case StatusEnum.Completed:
              return EventStatus.Completed;
            case StatusEnum.Cancelled:
              return EventStatus.Cancelled;

            case StatusEnum.Changed:
            case StatusEnum.ImpactChanged:
              return prev;

            default:
              break;
          }
        })();

        if (!status) {
          if (update.status !== StatusEnum.Description)
            log.debug("Skipped Unknown Status.", update, event);
          continue;
        }

        const history = {
          Id: update.id,
          Message: update.text,
          Created: dayjs(update.timestamp).toDate(),
          Status: status,
          Event: dbEvent,
        };

        dbEvent.Histories.add(history);
        prev = status;
      }

      const status = orderBy(
        Array.from(dbEvent.Histories), x => x.Created, "desc"
      ).at(0)?.Status;
      if (status) {
        dbEvent.Status = status;
      }
    }

    if (dbEvent.End &&
      !IsIncident(type) &&
      dbEvent.Status !== EventStatus.Cancelled &&
      dayjs(dbEvent.End).isBefore(dayjs())) {
      dbEvent.Status = EventStatus.Completed;
    }

    db.Events.push(dbEvent);
  }

  log.debug("Status data loaded.", db);
  return db;
}
