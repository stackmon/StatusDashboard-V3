import { useRequest } from "ahooks";
import { openDB } from "idb";
import { createContext, useContext, useState } from "react";
import { Dic } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
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
 * @example
 * ```typescript
 * const initialContext = EmptyDB();
 * console.log(initialContext.Services); // Outputs: []
 * ```
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
    Histories: [],
    RegionService: [],
  }
}

/**
 * A global variable representing the current state of the status database.
 *
 * @remarks
 * This variable is initialized with the structure provided by the `EmptyDB` function.
 * It is used throughout the application to access and update the status data.
 *
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

/**
 * Initializes the IndexedDB database for storing status information.
 *
 * @returns A promise that resolves to the initialized database instance.
 *
 * @remarks
 * This function sets up the IndexedDB database with the necessary object stores.
 * It is called internally to ensure the database is ready for use.
 *
 * @since 1.0.0
 * @version 0.1.0
 */
function init() {
  return openDB(Dic.Name, 1, {
    upgrade(db) {
      db.createObjectStore(Store);
    },
  });
}

/**
 * Saves the current state of the status database to IndexedDB.
 *
 * @returns A promise that resolves when the save operation is complete.
 *
 * @remarks
 * This function writes the current state of the `DB` variable to the IndexedDB database.
 * It is called whenever the status data is updated to persist the changes.
 *
 * @since 1.0.0
 * @version 0.1.0
 */
async function save() {
  const db = await init();
  await db.put(Store, DB, Store);
  db.close();
}

/**
 * Loads the status database from IndexedDB.
 *
 * @returns A promise that resolves when the load operation is complete.
 *
 * @remarks
 * This function reads the status data from the IndexedDB database and updates the `DB` variable.
 * It is called during the initialization of the application to restore the previous state.
 *
 * @since 1.0.0
 * @version 0.1sv.0
 */
async function load() {
  const db = await init();
  const res = await db.get(Store, Store) as IStatusContext;
  if (res) {
    DB = res;
  }
  db.close();
}

/**
 * Loads the status database from IndexedDB.
 *
 * @returns {Promise<void>} A promise that resolves when the load operation is complete.
 *
 * @remarks
 * This function reads the status data from the IndexedDB database and updates the `DB` variable.
 * It is called during the initialization of the application to restore the previous state.
 *
 * @since 1.0.0
 * @version 0.1sv.0
 */
await load();

const log = new Logger("Service", "Status");

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
  const [db, setDB] = useState(DB);

  const url = process.env.SD_BACKEND_URL;

  useRequest(
    async () => {
      log.info(`Loading status data from v2...`);

      const compLink = `${url}/components`;
      const compRes = await fetch(compLink);
      const compData = await compRes.json();

      log.debug("Components Status loaded.", compData);

      const eventLink = `${url}/incidents`;
      const eventRes = await fetch(eventLink);
      const eventData = (await eventRes.json()).data;

      log.debug("Events loaded.", eventData);

      return {
        Components: compData as StatusEntityV2[],
        Events: eventData as IncidentEntityV2[]
      };
    },
    {
      cacheKey: log.namespace,
      onSuccess: (res) => update(TransformerV2(res)),
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
