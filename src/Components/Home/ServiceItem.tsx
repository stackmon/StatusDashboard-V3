import { CounterBadge, FluentProvider, webLightTheme } from "@fluentui/react-components";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useState } from "react";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { EventType, IsIncident, IsOpenStatus } from "../Event/Enums";
import { Indicator } from "./Indicator";
import "./ServiceItem.css";

interface IServiceItem {
  RegionService: Models.IRegionService;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.3.0
 */
export function ServiceItem({ RegionService }: IServiceItem) {
  const { DB } = useStatus();

  const [type, setType] = useState(EventType.Operational);
  const [future, setFuture] = useState(false);
  const [nonInfoId, setNonInfoId] = useState<number>();
  const [infoId, setInfoId] = useState<number>();

  useEffect(() => {
    const openEvents = chain([...RegionService.Events])
      .filter(x => {
        if (IsIncident(x.Type) && x.End) {
          return false;
        }
        return IsOpenStatus(x.Status);
      })
      .value();

    const nonInfoEvent = chain(openEvents)
      .filter(x => x.Type !== EventType.Information)
      .orderBy(x => x.Type, 'desc')
      .head()
      .value();

    const infoEvent = chain(openEvents)
      .filter(x => x.Type === EventType.Information)
      .filter(x => IsOpenStatus(x.Status))
      .orderBy(x => x.Start, 'desc')
      .head()
      .value();

    if (nonInfoEvent) {
      setType(nonInfoEvent.Type);
      setFuture(dayjs(nonInfoEvent.Start).isAfter(dayjs()));
      setNonInfoId(nonInfoEvent.Id);
    } else {
      setType(EventType.Operational);
      setFuture(false);
      setNonInfoId(undefined);
    }

    setInfoId(infoEvent?.Id);
  }, [DB, RegionService]);

  return (
    <li className="flex items-center py-2">
      {future ? (
        <a className="flex h-6" href={`/Event/${nonInfoId}`}>
          <FluentProvider className="with-dot" theme={webLightTheme}>
            <Indicator Type={EventType.Operational} />

            <CounterBadge className="blue-dot" dot />
          </FluentProvider>
        </a>
      ) :
        nonInfoId ? (
          <a className="flex items-center" href={`/Event/${nonInfoId}`}>
            <Indicator Type={type === EventType.Information ? EventType.Operational : type} />
          </a>
        ) : (
          <Indicator Type={type} />
        )}

      <label className="ml-2.5 text-xl font-medium text-slate-700 flex items-center justify-between w-full">
        <span>{RegionService.Service.Name}</span>

        {infoId && (
          <a href={`/Event/${infoId}`}>
            <Indicator Type={EventType.Information} />
          </a>
        )}
      </label>
    </li>
  );
}
