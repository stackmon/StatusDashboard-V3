import { ScaleDataGrid, ScaleIconActionCheckmark, ScaleIconActionMenu, ScaleMenuFlyoutItem, ScaleMenuFlyoutList } from "@telekom/scale-components-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Dic } from "~/Helpers/Entities";
import reviewsHistoryMock from "./reviewsHistoryMock.json";

const PAGE_SIZE_KEY = "reviewsPageSize";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * @author Aloento
 * @since 1.3.0
 * @version 0.3.0
 */
export function Reviews() {
  const gridRef = useRef<HTMLScaleDataGridElement>(null);

  const [pageSize, setPageSize] = useState<number>(() => {
    const stored = localStorage.getItem(PAGE_SIZE_KEY);
    return stored ? parseInt(stored, 10) : 10;
  });

  interface ReviewItem {
    id: number;
    planStartCET: string;
    planEndCET: string;
    region: string;
    service: string;
  }

  const historyItems = reviewsHistoryMock as ReviewItem[];

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

    const events = historyItems.map((item) => [
      item.id,
      item.planStartCET,
      item.planEndCET,
      item.region,
      item.service,
      [
        {
          label: "↗",
          variant: "secondary",
          href: `/Event/${item.id}`
        }
      ]
    ]);

    grid.rows = events;
  }, [gridRef.current, historyItems]);

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
