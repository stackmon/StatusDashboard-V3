import { useCreation, useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";

const log = new Logger("useAvailability");

interface ServiceAvaEntity {
  id: number
  name: string
  availability: AvailEntity[]
  region: string
}

interface AvailEntity {
  year: number
  month: number
  percentage: number
}

interface IAvailability {
  RS: Models.IRegionService,
  Percentages: number[]
}

/**
 * Custom hook to manage availability data based on the provided category and topic.
 * This hook interacts with the status service and fetches availability data from a backend service.
 * It processes and filters the data to return availability information for a specific region and category.
 *
 * @param category - The category of the service for which availability data is required.
 * @param topic - The topic used to subscribe to region updates.
 * @returns An array of availability information objects.
 *
 * @remarks
 * This hook uses various state and effect hooks to manage and update the availability data.
 * It also utilizes a custom logger for debugging purposes.
 * The data fetching is performed using a request hook with caching enabled.
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useAvailability(category: Models.ICategory, topic: string) {
  const { DB } = useStatus();

  const [region, setRegion] = useState(DB.Regions[0]);
  const regionSub = useCreation(
    () => Station.get<BehaviorSubject<Models.IRegion>>(topic), []);

  useEffect(() => {
    const sub = regionSub.subscribe(setRegion);
    return () => sub.unsubscribe();
  }, []);

  const [avas, setAvas] = useState<IAvailability[]>(
    () => DB.RegionService
      .filter(x => x.Region.Id === region.Id)
      .filter(x => x.Service.Category.Id === category.Id)
      .map(x => ({
        RS: x,
        Percentages: Array(6).fill(100)
      })));

  const url = process.env.SD_BACKEND_URL;

  const { data } = useRequest(async () => {
    const res = await fetch(`${url}/availability`);
    const data = (await res.json()).data as ServiceAvaEntity[];

    const raw = [] as IAvailability[];

    for (const service of data) {
      const rs = DB.RegionService.find(x => x.Id === service.id);

      if (!rs) {
        log.info("Service not found.", service);
        continue;
      }

      const ava = service.availability
        .map(x => x.percentage)
        .slice(0, 6)
        .reverse();

      raw.push({
        RS: rs,
        Percentages: ava
      });
    }

    log.debug("Availability data processed.", raw);
    return raw;
  }, {
    cacheKey: log.namespace
  });

  useEffect(() => {
    if (data) {
      const res = data
        .filter(x => x.RS.Region.Id === region.Id)
        .filter(x => x.RS.Service.Category.Id === category.Id);

      setAvas(res);
    }
  }, [data, category, region]);

  return avas;
}
