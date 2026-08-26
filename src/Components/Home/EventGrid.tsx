import { ScaleDataGrid } from "@telekom/scale-components-react";
import { useBoolean } from "ahooks";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { Dic } from "~/Helpers/Entities";
import { useShadowStyle } from "~/Helpers/useShadowStyle";
import { useStatus } from "~/Services/Status";
import { EventType, IsIncident, IsOpenStatus } from "../Event/Enums";
import { getEventTag } from "../History/EventTag";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.3.0
 */
export function EventGrid() {
  const { DB } = useStatus();
  const auth = useAuth();
  const ref = useRef<HTMLScaleDataGridElement>(null);
  const [hidden, { set }] = useBoolean();

  useShadowStyle(ref, `
    .data-grid__scroll-container {
      overflow: hidden !important;
    }

    .tbody__cell:has(.tbody__actions) {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    .tbody__mobile-title {
      display: none !important;
    }
  `);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const grid = ref.current;

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
