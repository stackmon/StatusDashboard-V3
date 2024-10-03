import { useCreation } from "ahooks";
import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function AvailaMatrix() {
  const { DB } = useStatus();
  const [region, setRegion] = useState(DB.Regions[0]);

  const topic = "Availability";
  const regionSub = useCreation(
    () => Station.get(topic, () => {
      const first = DB.Regions[0];
      return new BehaviorSubject(first);
    }), []);

  useEffect(() => {
    const sub = regionSub.subscribe(setRegion);
    return () => sub.unsubscribe();
  }, []);

  return <div>{region.Name}</div>;
}
