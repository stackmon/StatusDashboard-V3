import { Helmet } from "react-helmet";
import { useRouter } from "~/Components/Router";
import { useStatus } from "~/Services/Status";
import { NotFound } from "./404";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Event() {
  const { DB } = useStatus();

  const { Paths } = useRouter();
  const id = parseInt(Paths.at(1)!);

  const event = DB.Events.find(e => e.Id === id);

  if (isNaN(id) || !event) {
    return <NotFound />;
  }

  return <>
    <Helmet>
      <title>Event {id.toString()} - OTC Status Dashboard</title>
    </Helmet>
  </>
}
