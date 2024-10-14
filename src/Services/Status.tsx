import { useRequest } from "ahooks";
import { openDB } from "idb";
import { createContext, useContext, useState } from "react";
import { Dic } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { StatusEntity } from "./Status.Entities";
import { IStatusContext } from "./Status.Models";
import { Transformer } from "./Status.Trans";

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
  Update: (data: IStatusContext) => void;
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

  useRequest(
    async () => {
      log.info("Loading status data...");
      const response = await fetch(`${url}${uri}/component_status`);
      const data = await response.json();
      log.debug("Status data loaded.", data);
      return data as StatusEntity[];
    },
    {
      cacheKey: log.namespace,
      onSuccess: (list) => update(Transformer(list)),
    }
  );

  function update(data: IStatusContext) {
    DB = { ...data };
    setDB(DB);
    save();
  }

  return (
    <CTX.Provider value={{ DB: db, Update: update }}>{children}</CTX.Provider>
  );
}
