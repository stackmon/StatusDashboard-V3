import { useRequest } from "ahooks";
import { createContext, useState } from "react";
import { Logger } from "~/Helpers/Logger";
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
  RegionsServices: []
}

interface IContext {
  DB: IStatusContext;
  Update: (data: IStatusContext) => void;
}

const CTX = createContext<IContext>({} as IContext);

const log = new Logger("Service", "Status");

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function StatusContext({ children }: { children: JSX.Element }) {
  const [db, setDB] = useState(DB);

  useRequest(async () => {
    log.info("Loading status data...");
    const response = await fetch("https://status.cloudmon.eco.tsi-dev.otc-service.com/api/v1/component_status");
    const data = await response.json();
    log.debug("Status data loaded.", data);
    return data;
  }, {
    cacheKey: log.namespace,
    onSuccess: (data) => {

    }
  });

  function update(data: IStatusContext) {
    DB = { ...data };
    setDB(DB);
  }

  return (
    <CTX.Provider value={{ DB: db, Update: update }}>
      {children}
    </CTX.Provider>
  );
}
