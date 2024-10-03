import dayjs from "dayjs";
import { useEffect, useMemo, useRef } from "react";
import { Models } from "~/Services/Status.Models";

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

  return (
    <>
      {isBegin &&
        <label
          ref={label}
          className="mb-6 text-2xl font-medium text-slate-800"
        >
          {dayjs(Curr.Start).format("MMMM YYYY")}
        </label>}

    </>
  );
}
