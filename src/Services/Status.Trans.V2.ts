import dayjs from "dayjs";
import { orderBy } from "lodash";
import { EventStatus, EventType } from "~/Components/Event/Enums";
import { Logger } from "~/Helpers/Logger";
import { EmptyDB } from "./Status";
import { IncidentEntityV2, NameEnum, StatusEntityV2, StatusEnum } from "./Status.Entities";
import { IStatusContext, Models } from "./Status.Models";

const log = new Logger("Service", "Status", "TransformerV2");

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
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

    const type = (() => {
      switch (event.impact) {
        case 0:
          return EventType.Maintenance;
        case 1:
          return EventType.MinorIssue;
        case 2:
          return EventType.MajorIssue;
        default:
          return EventType.Outage;
      }
    })();

    const dbEvent: Models.IEvent = {
      Id: event.id,
      Title: event.title,
      Start: dayjs(event.start_date).toDate(),
      Type: type,
      Status: type === EventType.Maintenance ? EventStatus.Scheduled : EventStatus.Investigating,
      Histories: new Set(),
      RegionServices: new Set(),
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

    if (event.updates?.length) {
      for (const update of event.updates) {
        const status = (() => {
          switch (update.status) {
            case StatusEnum.System:
              return event.end_date
                ? EventStatus.Cancelled
                : EventStatus.Investigating;

            case StatusEnum.Analyzing:
              return EventStatus.Investigating;
            // @ts-expect-error TS7029
            case StatusEnum.Reopened:
              dbEvent.End = undefined;
            case StatusEnum.Fixing:
              return EventStatus.Fixing;
            case StatusEnum.Observing:
              return EventStatus.Monitoring;
            case StatusEnum.Resolved:
            case StatusEnum.Changed:
            case StatusEnum.ImpactChanged:
              return EventStatus.Resolved;

            case StatusEnum.Description:
            case StatusEnum.Scheduled:
            case StatusEnum.Modified:
              return EventStatus.Scheduled;
            case StatusEnum.InProgress:
              return EventStatus.Performing;
            case StatusEnum.Completed:
              return EventStatus.Completed;

            default:
              break;
          }
        })();

        if (!status) {
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
      }

      const status = orderBy(
        Array.from(dbEvent.Histories), x => x.Created, "desc"
      ).at(0)?.Status;
      if (status) {
        dbEvent.Status = status;
      }
    }

    if (dbEvent.End &&
      dbEvent.Type === EventType.Maintenance &&
      dbEvent.Status !== EventStatus.Cancelled &&
      dayjs(dbEvent.End).isBefore(dayjs())) {
      dbEvent.Status = EventStatus.Completed;
    }

    db.Events.push(dbEvent);
  }

  log.info("Status data loaded.", db);
  return db;
}
