import { FluentProvider, Toaster, webLightTheme } from "@fluentui/react-components";
import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { Suspense } from "react";
import { OIDCProvider } from "./Components/Auth";
import { AppErrorBoundary } from "./Components/ErrorBoundary";
import { PwaUpdate } from "./Components/Pwa/PwaUpdate";
import { BrowserRouter } from "./Components/Router";
import { Layout } from "./Pages";
import { StatusContext } from "./Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function App() {
  return (
    <AppErrorBoundary variant="root">
      <BrowserRouter>
        <FluentProvider theme={webLightTheme}>
          <Toaster />
        </FluentProvider>

        <PwaUpdate />

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
