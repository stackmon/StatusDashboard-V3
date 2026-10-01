import { Helmet } from "react-helmet";
import { Authorized, CanCreate } from "~/Components/Auth/With";
import { NewForm } from "~/Components/New/NewForm";
import { Dic } from "~/Helpers/Entities";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function NewEvent() {
  return (
    <Authorized rules={CanCreate}>
      <Helmet>
        <title>New Event - {Dic.Name} {Dic.Prod}</title>
      </Helmet>

      <h3 className="text-3xl font-medium text-slate-800">Create New Event</h3>

      <NewForm />
    </Authorized>
  )
}
