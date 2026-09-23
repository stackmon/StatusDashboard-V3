import { CounterBadge, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { useCreation } from "ahooks";
import { chain } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { BehaviorSubject } from "rxjs";
import { Authorized, Roles } from "~/Components/Auth/With";
import { EventStatus, EventType, IsIncident, IsOpenStatus } from "~/Components/Event/Enums";
import { Blink } from "~/Components/Home/Blink";
import { EventGrid } from "~/Components/Home/EventGrid";
import "~/Components/Home/Home.css";
import { Indicator } from "~/Components/Home/Indicator";
import { Notification } from "~/Components/Home/Notification";
import { RegionSelector } from "~/Components/Home/RegionSelector";
import { StatusCard } from "~/Components/Home/StatusCard";
import { Dic, Station } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { useStatus } from "~/Services/Status";

const log = new Logger("Home");

/**
 * @component
 * @author Aloento
 * @since 1.0.0
 * @version 0.4.0
 */
export function Home() {
  const { DB, Connection, SavedAt } = useStatus();
  const [region, setRegion] = useState(DB.Regions[0]);

  const topic = "HomeRegion";
  const regionSub = useCreation(
    () => Station.get(topic, () => {
      const first = DB.Regions[0];
      return new BehaviorSubject(first);
    }), []);

  useEffect(() => {
    const sub = regionSub.subscribe(setRegion);
    return () => sub.unsubscribe();
  }, []);

  const categories = useMemo(() => {
    return chain(DB.RegionService)
      .filter(rs => rs.Region.Id === region.Id)
      .map(rs => rs.Service.Category)
      .uniq()
      .orderBy(x => x.Name)
      .value();
  }, [DB, region]);

  const abnormalCount = useMemo(() => {
    const service = chain(DB.Events)
      .filter(e => !e.End)
      .filter(e => IsIncident(e.Type))
      .filter(e => IsOpenStatus(e.Status))
      .flatMap(e => [...e.RegionServices])
      .map(rs => rs.Service)
      .uniqBy(s => s.Id)
      .value();

    log.debug("Abnormal Services", service);
    return service.length;
  }, [DB]);

  const heading = abnormalCount > 0
    ? abnormalCount === 1
      ? `${abnormalCount} component has an issue, but don't worry, we are working on it.`
      : `${abnormalCount} components have issues, but don't worry, we are working on it.`
    : "All Systems Operational";

  const pendingCount = useMemo(() => {
    const events = chain(DB.Events)
      .filter(e => e.Status === EventStatus.PendingReview)
      .value();

    log.debug("Pending Maintenance", events);
    return events.length;
  }, [DB]);

  return (
    <>
      <Helmet>
        <title>{Dic.Name} {Dic.Prod}</title>
      </Helmet>

      <Authorized rules={(groups) => {
        return pendingCount > 0 &&
          groups.some(g => g === Roles.Operators || g === Roles.Admins || g === Roles.GitHub);
      }}>
        <Notification
          heading={`You have ${pendingCount} maintenance events pending for review.`}
          opened
          variant="informational"
        />
      </Authorized>

      <Notification
        heading={heading}
        opened
        variant={abnormalCount > 0 ? "warning" : "success"}
      />

      <EventGrid />

      <RegionSelector Title="Current Status" Topic={topic} />

      <section className="grid-cols-1 grid gap-x-7 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cate, i) => (
          <StatusCard key={i} Category={cate} />
        ))}
      </section>

      <section className="flex flex-wrap justify-between gap-y-2 py-2">
        <Blink Connection={Connection} SavedAt={SavedAt} />

        <legend className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {Object.values(EventType).map((state, i) => (
            <div key={i} className="flex gap-x-2">
              <Indicator Type={state} />
              <label>{state}</label>
            </div>
          ))}

          <div className="flex gap-x-2 self-end">
            <FluentProvider className="with-dot" theme={webLightTheme}>
              <Indicator Type={EventType.Operational} />
              <CounterBadge className="blue-dot" dot />
            </FluentProvider>
            <label>Planned Maintenance</label>
          </div>
        </legend>
      </section>
    </>
  );
}
