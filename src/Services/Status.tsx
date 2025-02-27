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
 * Initializes an empty database context for status information.
 *
 * @returns {IStatusContext} An object containing empty arrays for various status-related data.
 *
 * @remarks
 * This function sets up the initial structure for the status database context.
 * It is used to ensure that the database has a consistent structure before any data is loaded.
 *
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
 * Custom hook to access the status context.
 *
 * @returns The current status context.
 *
 * @throws {Promise} If the status data is not yet loaded.
 *
 * @remarks
 * This hook provides access to the status context, allowing components to read and update the status data.
 *
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
 * Status context provider component.
 *
 * @param {Object} props - The component props.
 * @param {JSX.Element} props.children - The child components to be wrapped by the provider.
 *
 * @returns The status context provider component.
 *
 * @remarks
 * This component provides the status context to its upper components.
 * It fetches the status data from the backend and updates the context accordingly.
 *
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

  useMount(() => {
    const sub = Station.get<Subject<Date>>("Update", () => new Subject());
    setInterval(() => {
      runAsync().then(() => sub.next(new Date()));
    }, 60000);
  });

  function update(data: IStatusContext = ins) {
    const raw = { ...data };
    setDB(raw);
    db.save(key, raw);
  }

  return (
    <CTX.Provider value={{ DB: ins, Update: update }}>{children}</CTX.Provider>
  );
}
