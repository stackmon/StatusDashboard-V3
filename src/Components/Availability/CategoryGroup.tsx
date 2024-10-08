import { Models } from "~/Services/Status.Models";

interface ICategoryGroup {
  Category: Models.ICategory;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function CategoryGroup({ Category }: ICategoryGroup) {
  const services = Array.from(Category.Services);

  return <>
    <tr>
      <td rowSpan={services.length} className="text-lg">
        {Category.Name}
      </td>

      <td className="text-lg">
        {services[0].Name}
      </td>

    </tr>
  </>;
}
