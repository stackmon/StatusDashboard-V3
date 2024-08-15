import { useRequest } from "ahooks";
import dayjs from "dayjs";
import { createContext, useState } from "react";
import { EventStatus, EventType } from "~/Components/Event/Enums";
import { Logger } from "~/Helpers/Logger";
import { NameEnum, StatusEntity, StatusEnum } from "./Status.Entities";
import { IStatusContext } from "./Status.Models";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export let DB: IStatusContext = {
  Services: [],
  Categories: [],
  Regions: [],
  Events: [],
  Histories: [],
  RegionService: [],
};

interface IContext {
  DB: IStatusContext;
  Update: (data: IStatusContext) => void;
}

const CTX = createContext<IContext>({} as IContext);

const log = new Logger("Service", "Status");
let id = 0;

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function StatusContext({ children }: { children: JSX.Element }) {
  const [db, setDB] = useState(DB);

  useRequest(
    async () => {
      log.info("Loading status data...");
      const response = await fetch(
        "https://status.cloudmon.eco.tsi-dev.otc-service.com/api/v1/component_status"
      );
      const data = await response.json();
      log.debug("Status data loaded.", data);
      return data as StatusEntity[];
    },
    {
      cacheKey: log.namespace,
      onSuccess: (list) => {
        for (const item of list) {
          if (item.attributes.length < 3) {
            log.debug("Skipped Hidden Item.", item);
            continue;
          }

          const targetCate = item.attributes.find(
            (x) => x.name === NameEnum.Category
          )?.value;
          if (!targetCate) {
            log.debug("Skipped Null Category.", item);
            continue;
          }

          let dbCate = db.Categories.find((x) => x.Name === targetCate);
          if (!dbCate) {
            dbCate = { Id: id++, Name: targetCate, Services: new Set() };
            db.Categories.push(dbCate);
          }

          const targetRegion = item.attributes.find(
            (x) => x.name === NameEnum.Region
          )?.value;
          if (!targetRegion) {
            log.debug("Skipped Null Region.", item);
            continue;
          }

          let dbRegion = db.Regions.find((x) => x.Name === targetRegion);
          if (!dbRegion) {
            dbRegion = { Id: id++, Name: targetRegion, Services: new Set() };
            db.Regions.push(dbRegion);
          }

          const targetService = item.name;

          let dbService = db.Services.find((x) => x.Name === targetService);
          if (!dbService) {
            const abbr = item.attributes.find((x) => x.name === NameEnum.Type)?.value;
            if (!abbr) {
              log.debug("Skipped Null Abbr.", item);
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
              Region: dbRegion,
              Service: dbService,
              Events: new Set(),
            };
            db.RegionService.push(regionService);
          }

          for (const incident of item.incidents) {
            let dbEvent = db.Events.find((x) => x.Id === incident.id);

            if (!dbEvent) {
              const type = (() => {
                switch (incident.impact) {
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

              dbEvent = {
                Id: incident.id,
                Title: incident.text,
                Start: dayjs(incident.start_date),
                End: dayjs(incident.end_date),
                Type: type,
                Histories: new Set(),
                RegionServices: new Set([regionService]),
              };

              for (const update of incident.updates) {
                const status = (() => {
                  switch (update.status) {
                    case StatusEnum.System:
                      return incident.end_date ? EventStatus.Cancelled : EventStatus.Investigating;

                    case StatusEnum.Analyzing:
                      return EventStatus.Investigating;
                    case StatusEnum.Fixing:
                    case StatusEnum.Reopened:
                      return EventStatus.Fixing;
                    case StatusEnum.Observing:
                      return EventStatus.Monitoring;
                    case StatusEnum.Resolved:
                    case StatusEnum.Changed:
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
                  log.debug("Skipped Unknown Status.", update, incident);
                  continue;
                }

                const history = {
                  Id: id++,
                  Message: update.text,
                  Created: dayjs(update.timestamp),
                  Status: status,
                  Event: dbEvent
                };

                dbEvent.Histories.add(history);
              }

              db.Events.push(dbEvent);
            } else {
              dbEvent.RegionServices.add(regionService);
            }

            regionService.Events.add(dbEvent);
          }
        }

        log.info("Status data loaded.", db);
        update(db);
      },
    }
  );

  function update(data: IStatusContext) {
    DB = { ...data };
    setDB(DB);
  }

  return (
    <CTX.Provider value={{ DB: db, Update: update }}>{children}</CTX.Provider>
  );
}