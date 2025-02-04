import { ScaleTable } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useAvailability } from "~/Services/Availability";
import { CategoryGroup } from "./CategoryGroup";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function AvailaMatrix() {
  const { Region } = useAvailability();

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
          </tr>

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
        </thead>

        <tbody>
          {chain(Array.from(Region.Services))
            .map(x => x.Category)
            .uniqBy(x => x.Id)
            .orderBy(x => x.Name)
            .map((x, i) => <CategoryGroup key={i} Category={x} />)
            .value()}
        </tbody>
      </table>

      <template>
        <p className="bg-emerald-100 hover:bg-emerald-200" />
        <p className="bg-amber-100 hover:bg-amber-200" />
        <p className="bg-rose-100 hover:bg-rose-200" />
      </template>
    </ScaleTable>
  );
}
