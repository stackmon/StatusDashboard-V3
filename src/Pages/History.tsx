import { ScaleDataGrid } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { EventType } from "~/Components/Event/Enums";
import { EventFilters } from "~/Components/History/EventFilters";
import { useEventFilters } from "~/Components/History/useEventFilters";
import { Dic } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.2.0
 * @version 1.1.0
 */
export function History() {
  const { DB } = useStatus();
  const gridRef = useRef<HTMLScaleDataGridElement>(null);

  const {
    filters,
    validation,
    filteredEvents,
    setFilters,
    setValidation,
    clearFilters,
  } = useEventFilters(DB.Events);

  useEffect(() => {
    if (!gridRef.current) {
      return;
    }

    const grid = gridRef.current;

    grid.fields = [
      { type: "number", label: "ID", sortable: true },
      { type: "tags", label: "Type", sortable: true },
      { type: "date", label: "Start CET", sortable: true },
      { type: "date", label: "End CET", sortable: true },
      { type: "text", label: "Status", sortable: true },
      { type: "text", label: "Region", sortable: true },
      { type: "text", label: "Service", sortable: true, stretchWeight: 0.8 },
      { type: "actions", label: "Detail" },
    ];

    const events = chain(filteredEvents)
      .map((x) => {
        const rs = Array.from(x.RegionServices);

        const Services = chain(rs)
          .map(s => s.Service.Name)
          .uniq()
          .value();

        const Regions = chain(rs)
          .map(r => r.Region.Name)
          .uniq()
          .value();

        let tag;
        switch (x.Type) {
          case EventType.Minor:
            tag = { content: EventType.Minor, color: "yellow" };
            break;
          case EventType.Major:
            tag = { content: EventType.Major, color: "orange" };
            break;
          case EventType.Outage:
            tag = { content: EventType.Outage, color: "red" };
            break;
          case EventType.Maintenance:
            tag = { content: EventType.Maintenance, color: "cyan" };
            break;
          default:
            tag = { content: EventType.Information, color: "standard" };
        }

        return [
          x.Id,
          [tag],
          dayjs(x.Start).tz(Dic.TZ).format(Dic.Time),
          x.End ? dayjs(x.End).tz(Dic.TZ).format(Dic.Time) : "-",
          x.Status,
          Regions.join(", "),
          Services.length > 2
            ? `${Services.slice(0, 2).join(", ")} +${Services.length - 2}`
            : Services.join(", "),
          [
            {
              label: "↗",
              variant: "secondary",
              href: `/Event/${x.Id}`
            }
          ]
        ];
      })
      .value();

    grid.rows = events;
  }, [gridRef.current, filteredEvents]);

  return <div className="h-full flex flex-col gap-4">
    <Helmet>
      <title>History - OTC Status Dashboard</title>
    </Helmet>

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

    <section className="flex-grow min-h-0">
      <ScaleDataGrid
        className="h-full rounded-lg bg-white shadow-md"
        pageSize={10}
        heading="OTC Event History"
        hideBorder
        ref={gridRef}
      />
    </section>
  </div>;
}
