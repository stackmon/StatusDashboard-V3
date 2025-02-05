import { useRequest } from "ahooks";
import { createContext, JSX, useContext, useState } from "react";
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

  useRequest(
    async () => {
      log.info(`Loading status data from v2...`);

      const compLink = `${url}/v2/components`;
      const compRes = await fetch(compLink);
      const compData = await compRes.json();

      log.debug("Components Status loaded.", compData);

      const eventLink = `${url}/v2/incidents`;
      const eventRes = await fetch(eventLink);
      const eventData = (await eventRes.json()).data;

      log.debug("Events loaded.", eventData);

      return {
        Components: compData as StatusEntityV2[],
        Events: eventData as IncidentEntityV2[]
      };
    },
    {
      cacheKey: key,
      onSuccess: (res) => update(TransformerV2(res)),
    }
  );

  function update(data: IStatusContext = ins) {
    const raw = { ...data };
    setDB(raw);
    db.save(key, raw);
  }

  return (
    <CTX.Provider value={{ DB: ins, Update: update }}>{children}</CTX.Provider>
  );
}
