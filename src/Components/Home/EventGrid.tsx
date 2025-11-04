import { ScaleDataGrid } from "@telekom/scale-components-react";
import { useBoolean, useCreation } from "ahooks";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { Dic } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";
import { EventType, IsIncident, IsOpenStatus } from "../Event/Enums";
import { getEventTag } from "../History/EventTag";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.1
 */
export function EventGrid() {
  const { DB } = useStatus();
  const auth = useAuth();
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
      { type: "number", label: "ID", sortable: true },
      { type: "tags", label: "Type", sortable: true },
      { type: "date", label: "Start CET", sortable: true },
      { type: "text", label: "Status / Plan CET", sortable: true },
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
          if (auth.isAuthenticated) {
            return IsOpenStatus(x.Status);
          }

          return false;
        }

        return IsOpenStatus(x.Status);
      })
      .orderBy([
        x => {
          switch (x.Type) {
            case EventType.Outage: return 0;
            case EventType.Major: return 1;
            case EventType.Minor: return 2;
            case EventType.Maintenance: return 3;
            case EventType.Information: return 4;
            default: return 5;
          }
        },
        x => x.Start
      ], ["asc", "desc"])
      .map(x => {
        const tagArray = getEventTag(x.Type);

        return [
          x.Id,
          tagArray,
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
  }, [ref.current, DB, auth.isAuthenticated]);

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
