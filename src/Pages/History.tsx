import { chain } from "lodash";
import { Helmet } from "react-helmet";
import { EventItem } from "~/Components/History/EventItem";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function History() {
  const { DB } = useStatus();

  return <>
    <Helmet>
      <title>Timeline - OTC Status Dashboard</title>
    </Helmet>

    <section className="flex flex-col gap-y-2">
      <h3 className="text-3xl font-medium text-slate-800">
        OTC Event Timeline
      </h3>
    </section>

    <ol className="flex flex-col pl-3 xl:pl-0">
      {chain(DB.Events)
        .orderBy(x => x.Start, "desc")
        .map((event, index, events) => [events[index - 1], event])
        .map(([prev, curr]) => (
          <EventItem key={curr.Id} Prev={prev} Curr={curr} />
        ))
        .value()}
    </ol>
  </>;
}
