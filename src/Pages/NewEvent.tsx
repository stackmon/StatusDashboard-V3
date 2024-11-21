import { Helmet } from "react-helmet";
import { Authorized } from "~/Components/Auth/With";

/**
 * The `NewEvent` component is responsible for rendering the interface
 * for creating a new event within the OTC Status Dashboard application.
 *
 * This component is wrapped with the `Authorized` component to ensure
 * that only authorized users can access the functionality provided.
 *
 * The main content of the component includes a heading that indicates
 * the purpose of the page, which is to create a new event.
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function NewEvent() {
  return (
    <Authorized>
      <Helmet>
        <title>New Event - OTC Status Dashboard</title>
      </Helmet>

      <h3 className="text-3xl font-medium text-slate-800">Create New Event</h3>

    </Authorized>
  )
}
