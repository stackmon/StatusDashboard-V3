import { useRequest } from "ahooks";
import { useState } from "react";
import { Logger } from "~/Helpers/Logger";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";

const log = new Logger("useAvailability");

interface ServiceAvaEntity {
  id: number
  name: string
  availability: AvaliaEntity[]
  region: string
}

interface AvaliaEntity {
  year: number
  month: number
  percentage: number
}

interface IAvailability {
  RegionService: Models.IRegionService,
  Percentages: number[]
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useAvailability() {
  const { DB } = useStatus();
  const [avas, setAvas] = useState<IAvailability[]>(
    () => DB.RegionService.map(x => ({
      RegionService: x,
      Percentages: Array(6).fill(100)
    })));

  const url = process.env.SD_BACKEND_URL;

  useRequest(async () => {
    const res = await fetch(`${url}/availability`);
    const data = (await res.json()).data as ServiceAvaEntity[];

    log.info("Availability data loaded.", data);
    return data;
  }, {
    cacheKey: log.namespace,
    onSuccess: (data) => {
      const res = [] as IAvailability[];

      for (const service of data) {
        const rs = DB.RegionService.find(x => x.Id === service.id);

        if (!rs) {
          log.warn("Service not found.", service);
          continue;
        }

        const ava = service.availability
          .map(x => x.percentage)
          .slice(0, 6)
          .reverse();

        res.push({
          RegionService: rs,
          Percentages: ava
        });
      }

      log.info("Availability data processed.", res);
      setAvas(res);
    }
  });

  return avas;
}
