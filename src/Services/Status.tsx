import { useRequest } from "ahooks";
import { createContext, JSX, useContext, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { ApiError } from "~/Helpers/ApiError";
import { resolveConnectionState, type ConnectionState } from "~/Helpers/Connection";
import { fetchPlus } from "~/Helpers/fetchPlus";
import { Logger } from "~/Helpers/Logger";
import { useAppToast } from "~/Helpers/useAppToast";
import { useNetworkStatus } from "~/Helpers/useNetworkStatus";
import { DB } from "./DB";
import { EventEntityV2, StatusEntityV2 } from "./Status.Entities";
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
  Refresh: () => Promise<unknown>;
  Connection: ConnectionState;
  SavedAt: Date | null;
  Error?: ApiError;
}

const CTX = createContext<IContext>({} as IContext);
const key = "Status";

await db.load(key);

const log = new Logger("Service", key);

let loading;

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
 * @version 0.2.0
 */
export function useStatus() {
  const ctx = useContext(CTX);

  if (db.Ins.Regions.length < 1) {
    loading ??= ctx.Refresh();
    throw loading;
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
 * @version 0.5.0
 */
export function StatusContext({ children }: { children: JSX.Element }) {
  const [ins, setDB] = useState(db.Ins);
  const [savedAt, setSavedAt] = useState<Date | null>(db.SavedAt);
  const [error, setError] = useState<ApiError>();
  const [reconnecting, setReconnecting] = useState(false);

  const auth = useAuth();
  const toast = useAppToast();
  const abortRef = useRef<AbortController | null>(null);
  const url = process.env.SD_BACKEND_URL;

  const { runAsync } = useRequest(
    async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      log.info(`Loading status data from v2...`);
      const token = auth.user?.access_token;

      const compLink = `${url}/v2/components`;
      const compData = await fetchPlus.getJson<StatusEntityV2[]>(compLink, { token, signal });

      log.debug("Components Status loaded.", compData);

      const first = await fetchPlus.getJson<{
        data?: EventEntityV2[];
        pagination?: { totalPages?: number };
      }>(`${url}/v2/events?page=1&limit=50`, { token, signal });

      const allEvents: EventEntityV2[] = [];

      if (first.data && Array.isArray(first.data)) {
        allEvents.push(...first.data);
      }

      const totalPages = first.pagination?.totalPages || 1;
      log.debug(`Total pages: ${totalPages}`);

      if (totalPages > 1) {
        const pagePromises = [];

        for (let page = 2; page <= totalPages; page++) {
          const eventLink = `${url}/v2/events?page=${page}&limit=50`;

          pagePromises.push(
            fetchPlus.getJson<{ data?: EventEntityV2[] }>(eventLink, { token, signal })
              .then(res => {
                log.debug(`Loaded page ${page}/${totalPages}, events: ${res.data?.length || 0}`);
                return res.data || [];
              })
          );
        }

        const remainingPages = await Promise.all(pagePromises);
        remainingPages.forEach(pageData => {
          signal.throwIfAborted();
          if (Array.isArray(pageData)) {
            allEvents.push(...pageData);
          }
        });
      }

      log.debug("Events loaded.", { total: allEvents.length });

      return {
        Components: compData,
        Events: allEvents as EventEntityV2[]
      };
    },
    {
      cacheKey: key,
      onSuccess: (res) => {
        setError(undefined);
        setReconnecting(false);
        update(TransformerV2(res));
      },
      onError: (err) => {
        if (abortRef.current?.signal.aborted) return;
        const apiError = err instanceof ApiError ? err : ApiError.fromNetwork(err);
        log.error("Status data load failed", apiError);
        setError(apiError);
        setReconnecting(false);
        loading = undefined;
      },
      refreshDeps: [auth.user?.access_token],
      pollingInterval: 60000,
      pollingWhenHidden: false,
    }
  );

  const { isOnline } = useNetworkStatus(() => {
    setReconnecting(true);
    runAsync()
      .then(() => toast.showSuccess("Back online, data refreshed."))
      .catch(() => { /* Refresh will retry on next interval */ });
  });

  const connection = resolveConnectionState({ isOnline, reconnecting, error });

  function update(data: IStatusContext = ins) {
    const raw = { ...data };
    setDB(raw);
    db.save(key, raw);
    setSavedAt(db.SavedAt);
  }

  return (
    <CTX.Provider value={{
      DB: ins,
      Update: update,
      Refresh: runAsync,
      Connection: connection,
      SavedAt: savedAt,
      Error: error
    }}>{children}</CTX.Provider>
  );
}
