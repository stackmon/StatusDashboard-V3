/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export const Product = "Status Dashboard";

export interface Branding {
  /** Display name of the deployment, from `SD_NAME`. */
  Name: string;
  /** Name the dashboard is installed as, from `SD_APP_NAME`. */
  App: string;
}

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export function branding(env: Record<string, string | undefined>): Branding {
  const Name = env.SD_NAME?.trim() || "T Cloud Public";

  return {
    Name,
    App: env.SD_APP_NAME?.trim() || `${Name} Status`,
  };
}
