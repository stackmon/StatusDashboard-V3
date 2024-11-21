import { ScaleTag } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useMemo, useRef } from "react";
import { Models } from "~/Services/Status.Models";
import { EventStatus } from "../Event/Enums";
import { Indicator } from "../Home/Indicator";

interface IEventItem {
  Prev?: Models.IEvent;
  Curr: Models.IEvent;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventItem({ Prev, Curr }: IEventItem) {
  const isBegin = useMemo(() => {
    if (!Prev)
      return true;

    return Prev.Start.getMonth() != Curr.Start.getMonth();
  }, [Prev]);

  const label = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (label.current) {
      const prev = label.current.previousElementSibling;
      if (prev && prev instanceof HTMLElement) {
        prev.style.paddingBottom = "0";
        prev.classList.add("mb-6");
      }
    }
  }, [label.current]);

  const services = useMemo(() => {
    return chain(Array.from(Curr.RegionServices))
      .map(x => x.Service)
      .uniqBy(x => x.Id)
      .value();
  }, [Curr.RegionServices]);

  const upper = services.map(x => ({
    Name: x.Name,
    Abbr: x.Abbr.toUpperCase()
  }));

  const servicesTxt = upper.length > 3
    ? upper.slice(0, 3).map(x => x.Abbr).join(", ") + ` (+${upper.length - 3})`
    : upper.map(x => x.Abbr).join(", ");

  const regions = useMemo(() => {
    return chain(Array.from(Curr.RegionServices))
      .map(x => x.Region.Name)
      .uniq()
      .value();
  }, [Curr.RegionServices]);

  const regionsTxt = regions.length > 2
    ? regions.slice(0, 2).join(", ") + ` (+${regions.length - 2})`
    : regions.join(", ");

  let color: any;

  switch (Curr.Status) {
    case EventStatus.Investigating:
    case EventStatus.Fixing:
    case EventStatus.Monitoring:
      color = "yellow";
      break;

    case EventStatus.Scheduled:
    case EventStatus.Performing:
      color = "violet";
      break;

    case EventStatus.Resolved:
    case EventStatus.Completed:
      color = "green";
      break;

    default:
      color = "standard";
      break;
  }

  return (
    <>
      {isBegin &&
        <label
          ref={label}
          className="mb-6 text-2xl font-medium text-slate-800"
        >
          {dayjs(Curr.Start).format("MMMM YYYY")}
        </label>}

      <li className="border-l-2 relative flex flex-col gap-y-2.5 border-slate-300 pb-10 pl-7 last:pb-0">
        <a className="w-fit text-2xl font-medium hover:underline" href={`/Event/${Curr.Id}`}>
          {servicesTxt} {regionsTxt} {Curr.Type}
        </a>

        <div className="flex gap-x-2.5">
          <ScaleTag color={color}>
            {Curr.Status}
          </ScaleTag>

          {services.slice(0, 3).map(service => (
            <ScaleTag key={service.Abbr}>
              {service.Name}
            </ScaleTag>
          ))}

          {services.length > 3 && (
            <ScaleTag>
              +{services.length - 3}
            </ScaleTag>
          )}
        </div>

        <label className="text-lg font-bold text-slate-500">
          {dayjs(Curr.Start).format("DD MMM, HH:mm")}

          {Curr.End && (
            <> - {dayjs(Curr.End).format("DD MMM, HH:mm [UTC]")}</>
          )}
        </label>

        <Indicator
          Class="absolute -left-3.5 top-0.5 bg-zinc-50"
          Type={Curr.Type}
        />
      </li>
    </>
  );
}
