import { ScaleDataGrid, ScaleIconActionCheckmark, ScaleIconActionMenu, ScaleMenuFlyoutItem, ScaleMenuFlyoutList } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { EventStatus } from "~/Components/Event/Enums";
import { Dic } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

const PAGE_SIZE_KEY = "reviewsPageSize";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * @author Aloento
 * @since 1.3.0
 * @version 0.3.0
 */
export function Reviews() {
  const { DB } = useStatus();
  const gridRef = useRef<HTMLScaleDataGridElement>(null);

  const [pageSize, setPageSize] = useState<number>(() => {
    const stored = localStorage.getItem(PAGE_SIZE_KEY);
    return stored ? parseInt(stored, 10) : 10;
  });

  const pendingEvents = DB.Events.filter((x) => x.Status === EventStatus.PendingReview);

  useEffect(() => {
    if (!gridRef.current) {
      return;
    }

    const grid = gridRef.current;

    grid.fields = [
      { type: "number", label: "ID", sortable: true },
      { type: "text", label: "Plan Start CET", sortable: true },
      { type: "text", label: "Plan End CET", sortable: true },
      { type: "text", label: "Region", sortable: true },
      { type: "text", label: "Service", sortable: true, stretchWeight: 0.8 },
      { type: "actions", label: "Detail" },
    ];

    const events = chain(pendingEvents)
      .map((x) => {
        const rs = Array.from(x.RegionServices);

        const services = chain(rs)
          .map(s => s.Service.Name)
          .uniq()
          .value();

        const regions = chain(rs)
          .map(r => r.Region.Name)
          .uniq()
          .value();

        return [
          x.Id,
          dayjs(x.Start).tz(Dic.TZ).format(Dic.Time),
          x.End ? dayjs(x.End).tz(Dic.TZ).format(Dic.Time) : "-",
          regions.join(", "),
          services.length > 2
            ? `${services.slice(0, 2).join(", ")} +${services.length - 2}`
            : services.join(", "),
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
  }, [gridRef.current, pendingEvents]);

  return (
    <>
      <Helmet>
        <title>Reviews - {Dic.Name} {Dic.Prod}</title>
      </Helmet>

      <ScaleDataGrid
        className="h-full rounded-lg bg-white shadow-md"
        pageSize={pageSize}
        heading="Pending Review Maintenances"
        hideBorder
        ref={gridRef}
      >
        <ScaleMenuFlyoutItem slot="menu" class="scale-menu-trigger">
          Page Size
          <ScaleIconActionMenu slot="prefix" className="mr-2" />

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
                  className="mr-2"
                  style={{
                    visibility: pageSize === size ? "visible" : "hidden"
                  }}
                />
              </ScaleMenuFlyoutItem>
            ))}
          </ScaleMenuFlyoutList>
        </ScaleMenuFlyoutItem>
      </ScaleDataGrid>
    </>
  );
}
