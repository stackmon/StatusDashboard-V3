import { Logger } from "~/Helpers/Logger";
import { EmptyDB } from "./Status";
import { IncidentEntityV2, NameEnum, StatusEntityV2 } from "./Status.Entities";
import { IStatusContext } from "./Status.Models";

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
    if (comp.attributes.length < 3) {
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
        Region: dbRegion,
        Service: dbService,
        Events: new Set(),
      };
      db.RegionService.push(regionService);
    }
  }

  log.info("Status data loaded.", db);
  return db;
}
