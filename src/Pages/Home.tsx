import { ScaleNotification } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { BehaviorSubject, Subject } from "rxjs";
import { EventType, IsOpenStatus } from "~/Components/Event/Enums";
import { EventGrid } from "~/Components/Home/EventGrid";
import "~/Components/Home/Home.css";
import { Indicator } from "~/Components/Home/Indicator";
import { RegionSelector } from "~/Components/Home/RegionSelector";
import { StatusCard } from "~/Components/Home/StatusCard";
import { Dic, Station } from "~/Helpers/Entities";
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

  const [update, setUpdate] = useState<Date>();

  const updateSub = useCreation(
    () => Station.get<Subject<Date>>("Update"), []);

  useEffect(() => {
    const sub = regionSub.subscribe(setRegion);
    const sub2 = updateSub.subscribe(setUpdate);
    return () => {
      sub.unsubscribe();
      sub2.unsubscribe();
    };
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
      .filter(e => IsOpenStatus(e.Status))
      .flatMap(e => [...e.RegionServices])
      .map(rs => rs.Service)
      .uniqBy(s => s.Id)
      .value();

    log.debug("Abnormal Services", service);
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
          <label>{update ? `Last Auto Update at ${dayjs(update).format(Dic.Time)}` : "Auto Refresh Enabled"}</label>
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
