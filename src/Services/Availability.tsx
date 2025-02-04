import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { useCreation, useRequest } from "ahooks";
import { createContext, JSX, Suspense, useContext, useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { DB } from "./DB";
import { useStatus } from "./Status";
import { Models } from "./Status.Models";

interface AvailEntity {
  year: number
  month: number
  percentage: number
}

interface ServiceAvaEntity {
  id: number
  name: string
  availability: AvailEntity[]
  region: string
}

interface IAvailability {
  RS: Models.IRegionService,
  Percentages: number[]
}

interface IContext {
  Availa: IAvailability[];
  Region: Models.IRegion
}

const db = new DB<IAvailability[]>(() => []);

const CTX = createContext<IContext>({} as IContext);
const key = "Availability";

await db.load(key);

const log = new Logger("Service", key);

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useAvailability() {
  const ctx = useContext(CTX);

  if (db.Ins.length < 1) {
    throw new Promise((res) => {
      const i = setInterval(() => {
        if (db.Ins.length > 0) {
          clearInterval(i);
          res(ctx);
        }
      }, 100);
    });
  }

  return ctx;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function AvailaContext({ children }: { children: JSX.Element }) {
  const { DB } = useStatus();
  const [region, setRegion] = useState(DB.Regions[0]);
  const [ins, setDB] = useState(db.Ins);

  const regionSub = useCreation(
    () => Station.get(key, () => {
      const first = DB.Regions[0];
      return new BehaviorSubject(first);
    }), []);

  useEffect(() => {
    const sub = regionSub.subscribe(setRegion);
    return () => sub.unsubscribe();
  }, []);

  const url = process.env.SD_BACKEND_URL;

  useRequest(async () => {
    const res = await fetch(`${url}/v2/availability`);
    const data = (await res.json()).data as ServiceAvaEntity[];

    const raw = [] as IAvailability[];

    for (const service of data) {
      const rs = DB.RegionService.find(x => x.Id === service.id);

      if (!rs) {
        log.info("Service not found.", service);
        continue;
      }

      if (!service.availability || service.availability.length < 6) {
        log.info(`Skipped ${key}.`, service);
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

    log.debug(`${key} data processed.`, raw);
    return raw;
  }, {
    cacheKey: key,
    onSuccess: (res) => {
      setDB(res);
      db.save(key, res);
    }
  });

  return (
    <CTX.Provider value={{ Availa: ins, Region: region }}>
      <Suspense fallback={<ScaleLoadingSpinner size="large" text={`Loading ${key}...`} />}>
        {children}
      </Suspense>
    </CTX.Provider>
  );
}
