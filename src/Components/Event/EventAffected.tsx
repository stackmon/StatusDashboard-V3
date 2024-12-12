import { ScaleTable } from "@telekom/scale-components-react";
import { useMemo } from "react";
import { Models } from "~/Services/Status.Models";

/**
 * A component that displays the affected regions for a given event.
 *
 * This component takes an event object and processes its region services
 * to generate a list of services and their corresponding affected regions.
 * The list is then rendered in a table format.
 *
 * @param {Models.IEvent} props.Event - The event object containing region services.
 *
 * @remarks
 * This component uses the `useMemo` hook to memoize the list of services and regions,
 * ensuring that the list is only recalculated when the event object changes.
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventAffected({ Event }: { Event: Models.IEvent }) {
  const list = useMemo(() => {
    const all = Array.from(Event.RegionServices);
    const l = new Map<string, Set<string>>();

    for (const item of all) {
      const service = item.Service.Name;
      const region = item.Region.Name;

      if (!l.has(service)) {
        l.set(service, new Set([region]));
      } else {
        l.get(service)!.add(region);
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
