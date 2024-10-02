import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { Suspense, useMemo } from "react";
import { PageFooter } from "~/Components/Layout/PageFooter";
import { TopNavBar } from "~/Components/Layout/TopNavBar";
import { useRouter } from "~/Components/Router";
import { NotFound } from "./404";
import { History } from "./History";
import { Home } from "./Home";

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

      case "History":
        return <History />;

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
    </div>
  );
}
