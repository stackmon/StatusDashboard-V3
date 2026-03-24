import { ReactNode } from "react";
import { useAuth } from "react-oidc-context";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function Authorized({ children, role }: { children: ReactNode, role?: string }): ReactNode {
  const auth = useAuth();

  if (auth.isAuthenticated || process.env.NODE_ENV === "development") {
    if (role && !((auth.user?.profile as any)?.groups as string[])?.includes(role)) {
      return null;
    }
    return children;
  }

  return null;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function NotAuthorized({ children }: { children: ReactNode }): ReactNode {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return null;
  }

  return children;
}
