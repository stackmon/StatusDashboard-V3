import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { Suspense, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { PageFooter } from "~/Components/Layout/PageFooter";
import { TopNavBar } from "~/Components/Layout/TopNavBar";
import { useRouter } from "~/Components/Router";
import { ErrorBanner } from "~/Components/StateViews";
import { useStatus } from "~/Services/Status";
import { NotFound } from "./404";
import { Availability } from "./Availability";
import { Event } from "./Event";
import { History } from "./History";
import { Home } from "./Home";
import { NewEvent } from "./NewEvent";
import { Reviews } from "./Reviews";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.3.0
 */
export function Layout() {
  const { Paths } = useRouter();
  const path = Paths.at(0);
  const auth = useAuth();
  const { Error: ctxError, Refresh, Connection } = useStatus();

  const match = useMemo(() => {
    switch (path) {
      case "signin-oidc":
        return <ScaleLoadingSpinner size="large" text="Login Redirecting..." />;

      case "login":
        auth.signinRedirect();
        return null;

      case "Reload":
        return <ScaleLoadingSpinner size="large" text="Reloading..." />;

      case "Event":
        return <Event />;

      case "History":
        return <History />;

      case "Availability":
        return <Availability />;

      case "NewEvent":
        return <NewEvent />;

      case "Reviews":
        return <Reviews />;

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

      {Connection !== "online" && (
        <div
          role="status"
          className={`text-center text-sm py-1 text-white ${Connection === "offline" ? "bg-red-600" : "bg-yellow-500"}`}
        >
          {Connection === "offline"
            ? "You are offline. Showing the data cached on this device."
            : "Reconnecting to the status API…"}
        </div>
      )}

      {ctxError && !(ctxError.isNetworkError && Connection !== "online") && (
        <div className="mx-auto w-full max-w-(--breakpoint-xl) px-3 pt-4">
          <ErrorBanner
            error={ctxError}
            onRetry={() => Refresh()}
            onAction={ctxError.isAuthError()
              ? () => auth.signinRedirect()
              : undefined}
            actionLabel={ctxError.isAuthError() ? "Log In" : undefined}
            onDismiss={() => { /* Error clears on next successful load */ }}
          />
        </div>
      )}

      <main className="mx-auto flex w-full max-w-(--breakpoint-xl) flex-col gap-y-8 px-3 pt-8">
        <Suspense fallback={<ScaleLoadingSpinner size="large" text="Loading..." />}>
          {match}
        </Suspense>
      </main>

      <PageFooter />
    </div>
  );
}
