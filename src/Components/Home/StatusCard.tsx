import { ScaleDivider } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import { chain } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { ServiceItem } from "./ServiceItem";

interface IStatusCard {
  Category: Models.ICategory;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function StatusCard({ Category }: IStatusCard) {
  const { DB } = useStatus();
  const [region, setRegion] = useState(DB.Regions[0]);

  const regionSub = useCreation(
    () => Station.get<BehaviorSubject<Models.IRegion>>("HomeRegion"), []);

  useEffect(() => {
    const sub = regionSub.subscribe(setRegion);
    return () => sub.unsubscribe();
  }, []);

  const services = useMemo(() =>
    chain(DB.RegionService)
      .filter(x => x.Region.Id === region.Id)
      .filter(x => x.Service.Category.Id === Category.Id)
      .orderBy(x => x.Service.Name)
      .value()
    , [DB, region, Category]);

  return (
    <div className="flex h-fit flex-col rounded-md bg-white px-3.5 py-5 shadow-md">
      <h3 className="px-3.5 text-2xl font-medium text-slate-800">
        {Category.Name}
      </h3>

      <ScaleDivider className="h-auto" />

      <ul className="px-3.5">
        {services.map((item, i) => (
          <ServiceItem key={i} RegionService={item} />
        ))}
      </ul>
    </div>
  );
}
