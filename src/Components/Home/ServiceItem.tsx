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
 * @version 0.2.3
 */
export function ServiceItem({ RegionService }: IServiceItem) {
  const { DB } = useStatus();

  const [type, setType] = useState(EventType.Operational);
  const [future, setFuture] = useState(false);
  const [id, setId] = useState<number>();

  useEffect(() => {
    const res = chain([...RegionService.Events])
      .filter(x => {
        if (IsIncident(x.Type) && x.End) {
          return false;
        }

        return IsOpenStatus(x.Status);
      })
      .orderBy(x => x.Type, 'desc')
      .head()
      .value();

    if (res) {
      setType(res.Type);
      setFuture(dayjs(res.Start).isAfter(dayjs()));
      setId(res.Id);
    }
    else {
      setType(EventType.Operational);
      setFuture(false);
      setId(undefined);
    }
  }, [DB, RegionService]);

  return (
    <li className="flex items-center py-2">
      {future ? (
        <a className="flex h-6" href={`/Event/${id}`}>
          <FluentProvider className="with-dot" theme={webLightTheme}>
            <Indicator Type={EventType.Operational} />

            <CounterBadge className="blue-dot" dot />
          </FluentProvider>
        </a>
      ) :
        id ? (
          <a className="flex items-center" href={`/Event/${id}`}>
            <Indicator Type={type === EventType.Information ? EventType.Operational : type} />
          </a>
        ) : (
          <Indicator Type={type} />
        )}

      <label className="ml-2.5 text-xl font-medium text-slate-700 flex items-center justify-between w-full">
        <span>{RegionService.Service.Name}</span>

        {type === EventType.Information && id && (
          <a href={`/Event/${id}`}>
            <Indicator Type={EventType.Information} />
          </a>
        )}
      </label>
    </li>
  );
}
