import { ScaleDataGrid } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import { useEffect, useRef } from "react";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventGrid() {
  const ref = useRef<HTMLScaleDataGridElement>(null);

  const observer = useCreation(() => {
    return new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === "childList") {
          const added = mutation.addedNodes as NodeListOf<HTMLElement>;

          added.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const cells = node.querySelectorAll(".tbody__cell") as NodeListOf<HTMLDivElement>;

              cells.forEach((cell) => {
                if (cell.querySelector(".tbody__actions")) {
                  cell.style.paddingTop = "0";
                  cell.style.paddingBottom = "0";
                }
              });
            }
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const grid = ref.current;

    observer.disconnect();
    observer.observe(grid.shadowRoot!, {
      childList: true,
      subtree: true
    });

    grid.fields = [
      { type: "number", label: "ID" },
      { type: "tags", label: "Type" },
      { type: "date", label: "Start" },
      { type: "text", label: "Status / Plan" },
      { type: "text", label: "Region", sortable: true },
      { type: "text", label: "Service", sortable: true, stretchWeight: 0.7 },
      { type: "actions", label: "Detail" },
    ];

    grid.rows = [
      [
        212,
        [
          {
            "content": "Maintain",
            "color": "cyan"
          }
        ],
        "2024-09-09 08:30 UTC",
        "09-09 09:30",
        "EU-DE",
        "Anti DDoS",
        [
          {
            "label": "↗",
            "variant": "secondary",
            "href": "/Event/212"
          }
        ]
      ],
      [
        210,
        [
          {
            "content": "Minor",
            "color": "yellow"
          }
        ],
        "2024-08-29 14:00 UTC",
        "Investigating",
        "EU-DE +1",
        "Anti DDoS +1",
        [
          {
            "label": "↗",
            "variant": "secondary",
            "href": "/Event/210"
          }
        ]
      ]
    ];
  }, [ref.current]);

  return (
    <ScaleDataGrid
      className="rounded-lg bg-white shadow-md"
      pageSize={4}
      heading="Current Events"
      hideBorder
      ref={ref}
    />
  );
}
