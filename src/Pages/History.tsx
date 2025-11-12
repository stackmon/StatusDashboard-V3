import { ScaleDataGrid, ScaleIconActionCheckmark, ScaleIconActionMenu, ScaleMenuFlyoutItem, ScaleMenuFlyoutList } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { EventFilters } from "~/Components/History/EventFilters";
import { getEventTag } from "~/Components/History/EventTag";
import { useEventFilters } from "~/Components/History/useEventFilters";
import { Dic } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

const PAGE_SIZE_KEY = "historyPageSize";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * @author Aloento
 * @since 1.2.0
 * @version 1.2.2
 */
export function History() {
  const { DB } = useStatus();
  const gridRef = useRef<HTMLScaleDataGridElement>(null);

  const [pageSize, setPageSize] = useState<number>(() => {
    const stored = localStorage.getItem(PAGE_SIZE_KEY);
    return stored ? parseInt(stored, 10) : 20;
  });

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

        const tagArray = getEventTag(x.Type);

        return [
          x.Id,
          tagArray,
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
        pageSize={pageSize}
        heading="OTC Event History"
        hideBorder
        ref={gridRef}
      >
        <ScaleMenuFlyoutItem slot="menu" class="scale-menu-trigger" style={{ marginLeft: "0" }}>
          Page Size
          <ScaleIconActionMenu slot="prefix" style={{ display: "inline-flex" }} />

          <ScaleMenuFlyoutList slot="sublist">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <ScaleMenuFlyoutItem
                key={size}
                onScale-select={() => {
                  setPageSize(size);
                  localStorage.setItem(PAGE_SIZE_KEY, size.toString());
                }}
              >
                {size}
                <ScaleIconActionCheckmark
                  slot="prefix"
                  size={16}
                  style={{
                    display: "inline-flex",
                    visibility: pageSize === size ? "visible" : "hidden"
                  }}
                />
              </ScaleMenuFlyoutItem>
            ))}
          </ScaleMenuFlyoutList>
        </ScaleMenuFlyoutItem>
      </ScaleDataGrid>
    </section>
  </div>;
}
