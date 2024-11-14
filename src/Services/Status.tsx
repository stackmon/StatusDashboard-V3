import { useRequest } from "ahooks";
import { openDB } from "idb";
import { createContext, useContext, useState } from "react";
import { Dic } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { IncidentEntityV2, StatusEntityV1, StatusEntityV2 } from "./Status.Entities";
import { IStatusContext } from "./Status.Models";
import { TransformerV1 } from "./Status.Trans.V1";
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
    Histories: [],
    RegionService: [],
  }
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export let DB = EmptyDB();

interface IContext {
  DB: IStatusContext;
  Update: (data?: IStatusContext) => void;
}

const CTX = createContext<IContext>({} as IContext);
const Store = "Status";

function init() {
  return openDB(Dic.Name, 1, {
    upgrade(db) {
      db.createObjectStore(Store);
    },
  });
}

async function save() {
  const db = await init();
  await db.put(Store, DB, Store);
  db.close();
}

async function load() {
  const db = await init();
  const res = await db.get(Store, Store) as IStatusContext;
  if (res) {
    DB = res;
  }
  db.close();
}

await load();

const log = new Logger("Service", "Status");

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useStatus() {
  const ctx = useContext(CTX);

  if (DB.Regions.length < 1) {
    throw new Promise((res) => {
      const i = setInterval(() => {
        if (DB.Regions.length > 0) {
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
  const [db, setDB] = useState(DB);

  const url = process.env.SD_BACKEND_URL;
  const uri = process.env.SD_BACKEND_API;
  const file = process.env.SD_BACKEND_FILE === "true";
  const v2 = process.env.SD_BACKEND_V2 === "true";

  useRequest(
    async () => {
      log.info(`Loading status data from ${v2 ? "v2" : "v1"}...`);

      const compLink = file ? "/mock.json" : `${url}${uri}/${v2 ? "components" : "component_status"}`;
      const compRes = await fetch(compLink);
      const compData = await compRes.json();

      log.debug("Components Status loaded.", compData);

      if (v2) {
        const eventLink = file ? "/event.json" : `${url}${uri}/incidents`;
        const eventRes = await fetch(eventLink);
        const eventData = (await eventRes.json()).data;

        log.debug("Events loaded.", eventData);

        return {
          Components: compData as StatusEntityV2[],
          Events: eventData as IncidentEntityV2[]
        };
      }

      return compData as StatusEntityV1[];
    },
    {
      cacheKey: log.namespace,
      onSuccess: (res: any) => update(v2 ? TransformerV2(res) : TransformerV1(res)),
    }
  );

  function update(data: IStatusContext = DB) {
    DB = { ...data };
    setDB(DB);
    save();
  }

  return (
    <CTX.Provider value={{ DB: db, Update: update }}>{children}</CTX.Provider>
  );
}
