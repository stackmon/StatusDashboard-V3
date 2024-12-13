import { ScaleTable } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { Models } from "~/Services/Status.Models";

/**
 * The `EventLog` component is responsible for rendering the event log details.
 * It displays a table with updates and information related to the event histories.
 *
 * @param {Object} props - The properties object.
 * @param {Models.IEvent} props.Event - The event object containing histories.
 *
 * @remarks
 * This component utilizes the `ScaleTable` from `@telekom/scale-components-react` for styling.
 * The event histories are ordered by the creation date in descending order.
 * The date format used is "YYYY-MM-DD HH:mm [UTC]".
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventLog({ Event }: { Event: Models.IEvent }) {
  const list = chain(Array.from(Event.Histories))
    .orderBy(x => x.Created, "desc")
    .value();

  return (
    <ScaleTable class="rounded-md bg-white p-6 shadow-md">
      <table>
        <thead>
          <tr>
            <th>Updates</th>
            <th>Information</th>
          </tr>
        </thead>

        <tbody>
          {list.map((history, i) => (
            <tr key={i}>
              <td className="flex flex-col">
                <label className="font-medium">{history.Status}</label>

                <label>
                  {dayjs(history.Created).format("YYYY-MM-DD HH:mm [UTC]")}
                </label>
              </td>

              <td className="text-pretty">{history.Message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScaleTable >
  );
}
