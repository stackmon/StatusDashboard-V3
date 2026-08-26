import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { Suspense } from "react";
import { OIDCProvider } from "./Components/Auth";
import { AppErrorBoundary } from "./Components/ErrorBoundary";
import { BrowserRouter } from "./Components/Router";
import { Layout } from "./Pages";
import { StatusContext } from "./Services/Status";

/**
 * The main application component that sets up the routing, authentication, and status context.
 *
 * This component uses the `BrowserRouter` for server-side routing, the `OIDCProvider` for handling
 * Connect authentication, and the `StatusContext` for managing the web's status.
 *
 * The `Layout` component is rendered within these providers to ensure that all routes and
 * authentication states are properly managed.
 *
 * @returns The main application component with routing, authentication, and status context.
 */
export function App() {
  return (
    <AppErrorBoundary variant="root">
      <BrowserRouter>
        <OIDCProvider>
          <AppErrorBoundary variant="data">
            <Suspense fallback={<ScaleLoadingSpinner />}>
              <StatusContext>
                <Layout />
              </StatusContext>
            </Suspense>
          </AppErrorBoundary>
        </OIDCProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
