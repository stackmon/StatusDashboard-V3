import { useRequest } from "ahooks";
import { createContext, useContext, useState } from "react";
import { Logger } from "~/Helpers/Logger";
import { StatusEntity } from "./Status.Entities";
import { IStatusContext } from "./Status.Models";
import { Transformer } from "./Status.Trans";

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

const log = new Logger("Service", "Status");

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
      const response = await fetch("/api/v1/component_status");
      const data = await response.json();
      log.debug("Status data loaded.", data);
      return data as StatusEntity[];
    },
    {
      cacheKey: log.namespace,
      onSuccess: (list) => Transformer(list, update),
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
