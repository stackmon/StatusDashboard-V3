import { ScaleTable } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { Dic } from "~/Helpers/Entities";
import { Models } from "~/Services/Status.Models";

/**
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
                  {dayjs(history.Created).tz(Dic.TZ).format(Dic.TimeTZ)}
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
