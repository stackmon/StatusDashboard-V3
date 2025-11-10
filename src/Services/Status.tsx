import { useMount, useRequest } from "ahooks";
import { createContext, JSX, useContext, useState } from "react";
import { Subject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { DB } from "./DB";
import { IncidentEntityV2, StatusEntityV2 } from "./Status.Entities";
import { IStatusContext } from "./Status.Models";
import { TransformerV2 } from "./Status.Trans.V2";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EmptyDB(): IStatusContext {
  return {
    Services: [],
    Categories: [],
    Regions: [],
    Events: [],
    RegionService: [],
  }
}

const db = new DB(EmptyDB);

interface IContext {
  DB: IStatusContext;
  Update: (data?: IStatusContext) => void;
  Refresh: () => Promise<unknown>;
}

const CTX = createContext<IContext>({} as IContext);
const key = "Status";

await db.load(key);

const log = new Logger("Service", key);

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useStatus() {
  const ctx = useContext(CTX);

  if (db.Ins.Regions.length < 1) {
    throw new Promise((res) => {
      const i = setInterval(() => {
        if (db.Ins.Regions.length > 0) {
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
export function StatusContext({ children }: { children: JSX.Element }) {
  const [ins, setDB] = useState(db.Ins);

  const url = process.env.SD_BACKEND_URL;

  const { runAsync } = useRequest(
    async () => {
      log.info(`Loading status data from v2...`);

      const compLink = `${url}/v2/components`;
      const compRes = await fetch(compLink);
      const compData = await compRes.json();

      log.debug("Components Status loaded.", compData);

      const first = await fetch(`${url}/v2/events?page=1&limit=50`);
      const firstData = await first.json();

      const allEvents: IncidentEntityV2[] = [];

      if (firstData.data && Array.isArray(firstData.data)) {
        allEvents.push(...firstData.data);
      }

      const totalPages = firstData.pagination?.totalPages || 1;
      log.debug(`Total pages: ${totalPages}`);

      if (totalPages > 1) {
        const pagePromises = [];

        for (let page = 2; page <= totalPages; page++) {
          const eventLink = `${url}/v2/events?page=${page}&limit=50`;

          pagePromises.push(
            fetch(eventLink)
              .then(res => res.json())
              .then(data => {
                log.debug(`Loaded page ${page}/${totalPages}, events: ${data.data?.length || 0}`);
                return data.data || [];
              })
          );
        }

        const remainingPages = await Promise.all(pagePromises);
        remainingPages.forEach(pageData => {
          if (Array.isArray(pageData)) {
            allEvents.push(...pageData);
          }
        });
      }

      log.debug("Events loaded.", { total: allEvents.length });

      return {
        Components: compData as StatusEntityV2[],
        Events: allEvents as IncidentEntityV2[]
      };
    },
    {
      cacheKey: key,
      onSuccess: (res) => update(TransformerV2(res)),
    }
  );

  useMount(() => {
    const sub = Station.get<Subject<Date>>("Update", () => new Subject());

    const scheduleNext = () => {
      runAsync().then(() => {
        sub.next(new Date());
        setTimeout(scheduleNext, 60000);
      });
    };

    scheduleNext();
  });

  function update(data: IStatusContext = ins) {
    const raw = { ...data };
    setDB(raw);
    db.save(key, raw);
  }

  return (
    <CTX.Provider value={{ DB: ins, Update: update, Refresh: runAsync }}>{children}</CTX.Provider>
  );
}
