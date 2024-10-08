import { useCreation } from "ahooks";
import { chain } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { Calc6Months } from "~/Helpers/SLA";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";

interface ICategoryGroup {
  Category: Models.ICategory;
  Topic: string;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function CategoryGroup({ Category, Topic }: ICategoryGroup) {
  const { DB } = useStatus();

  const [region, setRegion] = useState(DB.Regions[0]);
  const regionSub = useCreation(
    () => Station.get<BehaviorSubject<Models.IRegion>>(Topic), []);

  useEffect(() => {
    const sub = regionSub.subscribe(setRegion);
    return () => sub.unsubscribe();
  }, []);

  const [services, slas] = useMemo(() => {
    const s = chain(DB.RegionService)
      .filter(x => x.Region.Id === region.Id)
      .filter(x => x.Service.Category.Id === Category.Id)
      .orderBy(x => x.Service.Name)
      .value();

    const a = chain(s)
      .map(x => Calc6Months(x))
      .value();

    return [s, a];
  }, [DB, region, Category]);

  function getColor(val: number): string {
    const color = val >= 99.95
      ? "emerald" : val >= 99
        ? "amber" : "rose";

    return `bg-${color}-100 hover:bg-${color}-200`;
  }

  return <>
    <tr>
      <td rowSpan={services.length} className="text-lg">
        {Category.Name}
      </td>

      <td className="text-lg">
        {services[0].Service.Name}
      </td>

      {slas[0].map((sla, i) => (
        <td key={i} className={`border-l text-center ${getColor(sla)}`}>
          {sla.toFixed(2)}
        </td>
      ))}
    </tr>

    {services.slice(1).map((service, i) => (
      <tr key={i}>
        <td className="text-lg">
          {service.Service.Name}
        </td>

        {slas[i + 1].map((sla, j) => (
          <td key={j} className={`border-l text-center ${getColor(sla)}`}>
            {sla.toFixed(2)}
          </td>
        ))}
      </tr>
    ))}
  </>;
}
