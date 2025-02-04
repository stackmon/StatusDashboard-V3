import { useMemo } from "react";
import { useAvailability } from "~/Services/Availability";
import { Models } from "~/Services/Status.Models";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function CategoryGroup({ Category }: { Category: Models.ICategory }) {
  const { Availa, Region } = useAvailability();

  const avas = useMemo(() => {
    const res = Availa
      .filter(x => x.RS.Region.Id === Region.Id)
      .filter(x => x.RS.Service.Category.Id === Category.Id);

    return res;
  }, [Availa, Region]);

  function getColor(val: number): string {
    const color = val >= 99.95
      ? "emerald" : val >= 99
        ? "amber" : "rose";

    return `bg-${color}-100 hover:bg-${color}-200`;
  }

  return <>
    <tr>
      <td rowSpan={avas.length} className="text-lg">
        {Category.Name}
      </td>

      <td className="text-lg">
        {avas[0].RS.Service.Name}
      </td>

      {avas[0].Percentages.map((perc, i) => (
        <td key={i} className={`border-l text-center ${getColor(perc)}`}>
          {perc.toFixed(2)}
        </td>
      ))}
    </tr>

    {avas.slice(1).map((ava, i) => (
      <tr key={i}>
        <td className="text-lg">
          {ava.RS.Service.Name}
        </td>

        {ava.Percentages.map((perc, j) => (
          <td key={j} className={`border-l text-center ${getColor(perc)}`}>
            {perc.toFixed(2)}
          </td>
        ))}
      </tr>
    ))}
  </>;
}
