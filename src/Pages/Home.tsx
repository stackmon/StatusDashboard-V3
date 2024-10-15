import { ScaleNotification } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import { chain, orderBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { BehaviorSubject } from "rxjs";
import { EventStatus, EventType } from "~/Components/Event/Enums";
import { EventGrid } from "~/Components/Home/EventGrid";
import "~/Components/Home/Home.css";
import { Indicator } from "~/Components/Home/Indicator";
import { RegionSelector } from "~/Components/Home/RegionSelector";
import { StatusCard } from "~/Components/Home/StatusCard";
import { Station } from "~/Helpers/Entities";
import { Logger } from "~/Helpers/Logger";
import { useStatus } from "~/Services/Status";

const log = new Logger("Home");

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Home() {
  const { DB } = useStatus();
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
      .filter(e => e.Type !== EventType.Maintenance)
      .filter(e => {
        const status = orderBy(Array.from(e.Histories), y => y.Created, 'desc').at(0)?.Status;
        if (!status) {
          return true;
        }
        return ![EventStatus.Completed, EventStatus.Resolved, EventStatus.Cancelled].includes(status);
      })
      .flatMap(e => [...e.RegionServices])
      .map(rs => rs.Service)
      .uniqBy(s => s.Id)
      .value();

    log.debug(service);
    return service.length;
  }, [DB]);

  const heading = abnormalCount > 0
    ? `${abnormalCount} components have issue, but don't worry, we are working on it.`
    : "All Systems Operational";

  return (
    <>
      <Helmet>
        <title>OTC Status Dashboard</title>
      </Helmet>

      <ScaleNotification
        heading={heading}
        opened
        variant={abnormalCount > 0 ? "warning" : "success"}
      />

      <EventGrid />

      <RegionSelector Title="OTC Current Status" Topic={topic} />

      <section className="grid-cols-1 grid gap-x-7 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cate, i) => (
          <StatusCard key={i} Category={cate} />
        ))}
      </section>

      <section className="flex flex-wrap justify-between gap-y-2 py-2">
        <div className="flex items-center gap-x-2">
          <div className="Blink" />
          <label>Auto Refresh Enabled</label>
        </div>

        <legend className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
          {Object.values(EventType).map((state, i) => (
            <div key={i} className="flex gap-x-2">
              <Indicator Type={state} />
              <label>{state}</label>
            </div>
          ))}
        </legend>
      </section>
    </>
  );
}
