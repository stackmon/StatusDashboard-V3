import { ScaleDataGrid } from "@telekom/scale-components-react";
import { useBoolean, useCreation } from "ahooks";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef } from "react";
import { Dic } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";
import { EventType, IsIncident, IsOpenStatus } from "../Event/Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.1
 */
export function EventGrid() {
  const { DB } = useStatus();
  const ref = useRef<HTMLScaleDataGridElement>(null);
  const [hidden, { set }] = useBoolean();

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
                } else if (cell.querySelector(".tbody__text-cell")) {
                  cell.style.textWrap = "auto";
                  cell.style.maxWidth = "510px";
                }
              });

              const mobileTitles = node.querySelectorAll('h5.tbody__mobile-title');
              mobileTitles.forEach((title) => {
                title.remove();
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
      { type: "date", label: "Start CET", sortable: true },
      { type: "text", label: "Status / Plan CET" },
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
          Regions
        }
      })
      .filter(x => {
        if (IsIncident(x.Type) && x.End) {
          return false;
        }

        if (x.Type === EventType.Information) {
          return false;
        }

        return IsOpenStatus(x.Status);
      })
      .orderBy(x => x.Start, "desc")
      .map(x => {
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
          x.End
            ? dayjs(x.End).tz(Dic.TZ).format(Dic.Time)
            : x.Status,
          x.Regions.join(", "),
          x.Services.length > 3
            ? `${x.Services.slice(0, 3).join(", ")} +${x.Services.length - 3}`
            : x.Services.join(", "),
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

    set(!events.length);
    grid.rows = events;
  }, [ref.current, DB]);

  if (hidden) {
    return null;
  }

  return (
    <ScaleDataGrid
      className="sm:rounded-lg sm:bg-white sm:shadow-md"
      pageSize={4}
      heading="Current Events"
      hideBorder
      ref={ref}
    />
  );
}
