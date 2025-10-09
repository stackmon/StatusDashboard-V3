import { FluentProvider, Toaster, webLightTheme } from "@fluentui/react-components";
import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { Suspense, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { PageFooter } from "~/Components/Layout/PageFooter";
import { TopNavBar } from "~/Components/Layout/TopNavBar";
import { useRouter } from "~/Components/Router";
import { useAnalytics } from "~/Helpers/Analytics";
import { NotFound } from "./404";
import { Availability } from "./Availability";
import { Event } from "./Event";
import { History } from "./History";
import { Home } from "./Home";
import { NewEvent } from "./NewEvent";
import { Timeline } from "./Timeline";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.1
 */
export function Layout() {
  useAnalytics();

  const { Paths } = useRouter();
  const path = Paths.at(0);
  const auth = useAuth();

  const match = useMemo(() => {
    switch (path) {
      case "signin-oidc":
        return <ScaleLoadingSpinner size="large" text="Login Redirecting..." />;

      case "signout-callback-oidc":
        return <ScaleLoadingSpinner size="large" text="Logout Redirecting..." />;

      case "login":
        auth.signinRedirect();
        return null;

      case "Reload":
        return <ScaleLoadingSpinner size="large" text="Reloading..." />;

      case "Event":
        return <Event />;

      case "Timeline":
        return <Timeline />;

      case "History":
        return <History />;

      case "Availability":
        return <Availability />;

      case "NewEvent":
        return <NewEvent />;

      case "":
      case undefined:
        return <Home />;

      default:
        return <NotFound />;
    }
  }, [path]);

  return (
    <div className="absolute flex min-h-full w-full min-w-96 flex-col bg-zinc-50">
      <TopNavBar />

      <main className="mx-auto flex w-full max-w-screen-xl flex-col gap-y-8 px-3 pt-8">
        <Suspense fallback={<ScaleLoadingSpinner size="large" text="Loading..." />}>
          {match}
        </Suspense>
      </main>

      <PageFooter />

      <FluentProvider theme={webLightTheme}>
        <Toaster />
      </FluentProvider>
    </div>
  );
}
