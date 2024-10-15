import { ScaleTable } from "@telekom/scale-components-react";
import { useMemo } from "react";
import { Models } from "~/Services/Status.Models";
import { EventType } from "./Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventAffected({ Event }: { Event: Models.IEvent }) {
  const list = useMemo(() => {
    const all = Array.from(Event.RegionServices);
    const l = new Map<string, Set<string>>();

    if (Event.Type === EventType.Maintenance) {
      for (const item of all) {
        const service = item.Service.Name;
        const region = item.Region.Name;

        if (!l.has(service)) {
          l.set(service, new Set([region]));
        } else {
          l.get(service)!.add(region);
        }
      }
    }

    return Array.from(l.entries());
  }, [Event]);

  return (
    <ScaleTable>
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Affected Regions</th>
          </tr>
        </thead>

        <tbody>
          {list.map(([service, regions], i) => (
            <tr key={i}>
              <td>{service}</td>
              <td>{Array.from(regions).join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScaleTable>
  );
}
