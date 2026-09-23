import type { ApiError } from "./ApiError";

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export type ConnectionState = "online" | "connecting" | "offline";

interface IConnectionInput {
  isOnline: boolean;
  reconnecting: boolean;
  error?: ApiError;
}

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export function resolveConnectionState({ isOnline, reconnecting, error }: IConnectionInput): ConnectionState {
  if (!isOnline) return "offline";
  if (reconnecting || error?.isNetworkError) return "connecting";
  return "online";
}
