import { OIDCProvider } from "./Components/Auth";
import { BrowserRouter } from "./Components/Router";
import { Layout } from "./Pages";
import { StatusContext } from "./Services/Status";

export function App() {
  return (
    <BrowserRouter>
      <OIDCProvider>
        <StatusContext>
          <Layout />
        </StatusContext>
      </OIDCProvider>
    </BrowserRouter>
  )
}
