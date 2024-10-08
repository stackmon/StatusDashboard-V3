import { ScaleTable } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";
import { CategoryGroup } from "./CategoryGroup";

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

  return (
    <ScaleTable className="relative">
      <table>
        <thead className="sticky top-16">
          <tr>
            <th className="!text-lg" rowSpan={2} scope="col">
              Category
            </th>

            <th className="!text-lg" rowSpan={2} scope="col">
              Service
            </th>

            <th className="!py-2 !text-center !text-lg" colSpan={6} scope="colgroup">
              Availability, %
            </th>

            <tr>
              {Array.from({ length: 6 }).map((_, i) => {
                const date = dayjs().subtract(5 - i, 'month');
                const month = date.format('MMMM');
                const year = date.year();

                return (
                  <th key={i} className="!pb-1 !text-lg !text-center w-1/12" scope="col">
                    {year} <br /> {month}
                  </th>
                );
              })}
            </tr>
          </tr>
        </thead>

        <tbody>
          {chain(Array.from(region.Services))
            .map(x => x.Category)
            .uniqBy(x => x.Id)
            .sortBy(x => x.Name, 'asc')
            .map((x, i) => <CategoryGroup key={i} Category={x} Topic={topic} />)
            .value()}
        </tbody>
      </table>
    </ScaleTable>
  );
}
