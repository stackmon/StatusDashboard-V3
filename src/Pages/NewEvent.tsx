import { Helmet } from "react-helmet";
import { Authorized } from "~/Components/Auth/With";
import { NewForm } from "~/Components/New/NewForm";

/**
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

      <NewForm />
    </Authorized>
  )
}
