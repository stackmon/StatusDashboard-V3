import { Logger } from "~/Helpers/Logger";
import { EmptyDB } from "./Status";
import { IncidentEntityV2, StatusEntityV2 } from "./Status.Entities";
import { IStatusContext } from "./Status.Models";

const log = new Logger("Service", "Status", "TransformerV1");

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function TransformerV2({ Components, Events }: { Components: StatusEntityV2[], Events: IncidentEntityV2[] }): IStatusContext {
  const db = EmptyDB();

  if (!Components?.length || !Events?.length) {
    log.warn("Empty List.");
    return db;
  }

  log.info("Status data loaded.", db);
  return db;
}
