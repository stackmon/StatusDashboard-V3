import { ReactNode, useMemo } from "react";
import { useAuth } from "react-oidc-context";

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export const Roles = {
  Creators: "sd_creators",
  Operators: "sd_operators",
  Admins: "sd_admins",
} as const;

const roleNames = new Set<string>(Object.values(Roles));

const userRolesClaim = "urn:zitadel:iam:org:project:roles";
const projectRolesClaimPrefix = "urn:zitadel:iam:org:project:";
const projectRolesClaimSuffix = ":roles";

function isRolesClaim(claim: string): boolean {
  return claim === userRolesClaim || (
    claim.startsWith(projectRolesClaimPrefix) &&
    claim.endsWith(projectRolesClaimSuffix)
  );
}

// Zitadel asserts a project role either as a key or as a value of the claim, one
// level below an organisation id, and repeats the same claim project scoped.
function collectRoles(value: unknown, roles: Set<string>): void {
  if (typeof value === "string") {
    if (roleNames.has(value)) roles.add(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(item => collectRoles(item, roles));
    return;
  }

  if (value && typeof value === "object") {
    for (const [name, nested] of Object.entries(value)) {
      if (roleNames.has(name)) roles.add(name);
      collectRoles(nested, roles);
    }
  }
}

/**
 * Returns the project roles Zitadel asserted for the current user.
 *
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export function useRoles(): ReadonlySet<string> {
  const auth = useAuth();

  return useMemo(() => {
    const roles = new Set<string>();

    for (const [claim, value] of Object.entries(auth.user?.profile ?? {})) {
      if (isRolesClaim(claim)) collectRoles(value, roles);
    }

    return roles;
  }, [auth.user]);
}

/**
 * @author Aloento
 * @since 1.6.0
 * @version 1.0.0
 */
export function CanApprove(roles: ReadonlySet<string>): boolean {
  return roles.has(Roles.Operators) || roles.has(Roles.Admins);
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.3.0
 */
export function Authorized({ children, rules }: { children: ReactNode, rules?: (roles: ReadonlySet<string>) => boolean }): ReactNode {
  const auth = useAuth();
  const roles = useRoles();

  if (auth.isAuthenticated && (!rules || rules(roles))) {
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
