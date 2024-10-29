import { ScaleDataGrid } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef } from "react";
import { useStatus } from "~/Services/Status";
import { EventStatus, EventType } from "../Event/Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventGrid() {
  const { DB } = useStatus();
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

    const events = chain(DB.Events)
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

        return {
          ...x,
          Services,
          Regions,
          Status: x.Status
        }
      })
      .filter(x => {
        if (x.Type !== EventType.Maintenance && x.End) {
          return false;
        }

        return ![EventStatus.Completed, EventStatus.Resolved, EventStatus.Cancelled]
          .includes(x.Status);
      })
      .orderBy(x => x.Start, "desc")
      .map(x => {
        let tag;

        switch (x.Type) {
          case EventType.MinorIssue:
            tag = { content: "Minor", color: "yellow" };
            break;
          case EventType.MajorIssue:
            tag = { content: "Major", color: "orange" };
            break;
          case EventType.Outage:
            tag = { content: "Outage", color: "red" };
            break;
          default:
            tag = { content: "Maintain", color: "cyan" };
            break;
        }

        return [
          x.Id,
          [tag],
          dayjs(x.Start).format("YYYY-MM-DD HH:mm [UTC]"),
          x.End
            ? dayjs(x.End).format("MM-DD HH:mm")
            : x.Status,
          x.Regions.length > 1
            ? `${x.Regions[0]} +${x.Regions.length - 1}`
            : x.Regions[0],
          x.Services.length > 1
            ? `${x.Services[0]} +${x.Services.length - 1}`
            : x.Services[0],
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

    if (!events.length) {
      grid.style.display = "none";
    }
  }, [ref.current, DB]);

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
