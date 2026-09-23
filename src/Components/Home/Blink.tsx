import dayjs from "dayjs";
import type { ConnectionState } from "~/Helpers/Connection";

interface IBlink {
  Connection: ConnectionState;
  SavedAt: Date | null;
}

interface IDescription {
  Title: string;
  Text: string;
}

function describe(connection: ConnectionState, savedAt: Date | null): IDescription {
  const cachedAt = savedAt ? dayjs(savedAt).format("HH:mm") : undefined;

  switch (connection) {
    case "offline":
      return {
        Title: "No network connection",
        Text: cachedAt
          ? `Offline — showing data cached at ${cachedAt}`
          : "Offline — no data cached on this device",
      };

    case "connecting":
      return {
        Title: "Connecting to the status API",
        Text: cachedAt ? `Connecting… last data at ${cachedAt}` : "Connecting…",
      };

    default:
      return {
        Title: "Connected",
        Text: cachedAt ? `Last Auto Update at ${cachedAt}` : "Auto Refresh Enabled",
      };
  }
}

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export function Blink({ Connection, SavedAt }: IBlink) {
  const { Title, Text } = describe(Connection, SavedAt);

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-x-2">
      <span aria-hidden="true" className={`Blink Blink--${Connection}`} title={Title} />
      <label>{Text}</label>
    </div>
  );
}
