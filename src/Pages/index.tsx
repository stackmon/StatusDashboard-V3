import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { useMemo } from "react";
import { useRouter } from "~/Components/Router";
import { NotFound } from "./404";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Layout() {
  const { Paths } = useRouter();
  const path = Paths.at(0);

  const match = useMemo(() => {
    switch (path) {
      case "Login":
        return <ScaleLoadingSpinner size="large" text="Login Redirecting..." />;

      case "Reload":
        return <ScaleLoadingSpinner size="large" text="Reloading..." />;

      case "":
      case undefined:
        return <div>Home</div>;

      default:
        return <NotFound />;
    }
  }, [path]);

  return <>
    {match}
  </>;
}
