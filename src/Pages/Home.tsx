import { ScaleNotification } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import { chain } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { BehaviorSubject } from "rxjs";
import { EventType } from "~/Components/Event/Enums";
import "~/Components/Home/Home.css";
import { Indicator } from "~/Components/Home/Indicator";
import { RegionSelector } from "~/Components/Home/RegionSelector";
import { Station } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

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
      .filter(rs => rs.Region === region)
      .map(rs => rs.Service.Category)
      .uniq()
      .sort()
      .value();
  }, [DB, region]);

  const abnormalCount = useMemo(() => {
    const service = chain(DB.Events)
      .filter(e => e.End === null)
      .flatMap(e => [...e.RegionServices])
      .map(rs => rs.Service)
      .uniqBy(s => s.Id)
      .value();

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

      <RegionSelector Title="OTC Current Status" Topic={topic} />

      <section className="flex flex-wrap justify-between gap-y-2 py-2">
        <div className="flex items-center gap-x-2">
          <div className="Blink" />
          <label>Auto Refresh Enabled</label>
        </div>

        <legend className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
          {Object.values(EventType).map(state => (
            <div className="flex gap-x-2">
              <Indicator Type={state} />
              <label>{state}</label>
            </div>
          ))}
        </legend>
      </section>
    </>
  );
}
