import { chain } from "lodash";
import { Helmet } from "react-helmet";
import { EventFilters } from "~/Components/History/EventFilters";
import { EventItem } from "~/Components/History/EventItem";
import { useEventFilters } from "~/Components/History/useEventFilters";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.1.0
 */
export function Timeline() {
  const { DB } = useStatus();

  const {
    filters,
    validation,
    filteredEvents,
    setFilters,
    setValidation,
    clearFilters,
  } = useEventFilters(DB.Events);

  return <>
    <Helmet>
      <title>Timeline - OTC Status Dashboard</title>
    </Helmet>

    <section className="flex flex-col gap-y-2">
      <h3 className="text-3xl font-medium text-slate-800">
        OTC Event Timeline
      </h3>
    </section>

    <EventFilters
      filters={filters}
      validation={validation}
      regions={DB.Regions}
      totalEvents={DB.Events.length}
      filteredCount={filteredEvents.length}
      onFiltersChange={setFilters}
      onValidationChange={setValidation}
      onClearFilters={clearFilters}
    />

    <ol className="flex flex-col pl-3 xl:pl-0">
      {chain(filteredEvents)
        .map((event, index, events) => [events[index - 1], event])
        .map(([prev, curr]) => (
          <EventItem key={curr.Id} Prev={prev} Curr={curr} />
        ))
        .value()}
    </ol>
  </>;
}
