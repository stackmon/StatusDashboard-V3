/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export class ApiError extends Error {
  public readonly timestamp: Date;

  private constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: string,
    public readonly isNetworkError = false
  ) {
    super(message);
    this.name = "ApiError";
    this.timestamp = new Date();
  }

  /** Create from a non-ok HTTP Response */
  static fromHttp(res: Response, body?: string): ApiError {
    const message = body
      ? `${res.status} ${res.statusText}: ${body}`
      : `${res.status} ${res.statusText}`;
    return new ApiError(message, res.status, body, false);
  }

  /** Create from a network-level error (fetch threw TypeError) */
  static fromNetwork(error: unknown): ApiError {
    const message = error instanceof Error ? error.message : "Network request failed";
    return new ApiError(message, undefined, message, true);
  }

  /** 4xx client errors */
  isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  /** 5xx server errors */
  isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  /** 401 or 403 */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** 404 */
  isNotFound(): boolean {
    return this.status === 404;
  }
}

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export function getUserFriendlyMessage(err: ApiError): string {
  if (err.isNetworkError) {
    return "Network error. Please check your connection.";
  }
  switch (err.status) {
    case 400: return "Bad request. Please check your input.";
    case 401: return "Your session has expired. Please log in again.";
    case 403: return "You do not have permission to perform this action.";
    case 404: return "The requested resource was not found.";
    case 409: return "Conflict. The data may have been modified by someone else.";
    case 429: return "Too many requests. Please try again later.";
    case 500:
    case 502:
    case 503: return "Server error. Please try again later.";
    default:
      if (err.isClientError()) return `Request error (${err.status}).`;
      if (err.isServerError()) return `Server error (${err.status}). Please try again later.`;
      return err.message || "An unexpected error occurred.";
  }
}

/**
 * @author Aloento
 * @since 1.5.0
 * @version 1.0.0
 */
export function errorFingerprint(err: ApiError): string {
  if (err.isNetworkError) return "network";
  if (err.status !== undefined) return `http-${err.status}`;
  return `unknown-${err.message}`;
}
