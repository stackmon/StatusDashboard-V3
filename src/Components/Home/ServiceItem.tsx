import { CounterBadge, FluentProvider, webLightTheme } from "@fluentui/react-components";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType, IsIncident, IsOpenStatus } from "../Event/Enums";
import { Indicator } from "./Indicator";
import "./ServiceItem.css";
import serviceSlugMap from "./serviceSlugMap.json";

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
  const auth = useAuth();

  const [type, setType] = useState(EventType.Operational);
  const [future, setFuture] = useState(false);
  const [nonInfoId, setNonInfoId] = useState<number>();
  const [infoId, setInfoId] = useState<number>();

  function getServiceSlug(serviceName: string): string {
    if (serviceName in serviceSlugMap) {
      return serviceSlugMap[serviceName as keyof typeof serviceSlugMap];
    }

    return serviceName
      .replace(/\s+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

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
      .filter(x => {
        if (!auth.isAuthenticated) {
          return x.Status === EventStatus.Active;
        }

        return IsOpenStatus(x.Status);
      })
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
  }, [DB, RegionService, auth.isAuthenticated]);

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
            <Indicator Type={type} />
          </a>
        ) : (
          <Indicator Type={type} />
        )}

      <label className="ml-2.5 text-xl font-medium text-slate-700 flex items-center justify-between w-full">
        <a
          href={`https://docs.otc.t-systems.com/${getServiceSlug(RegionService.Service.Name)}`}
          target="_blank"
        >
          {RegionService.Service.Name}
        </a>

        {infoId && (
          <a href={`/Event/${infoId}`}>
            <Indicator Type={EventType.Information} />
          </a>
        )}
      </label>
    </li>
  );
}
