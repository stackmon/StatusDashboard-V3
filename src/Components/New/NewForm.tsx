import { ScaleButton, ScaleDropdownSelect, ScaleDropdownSelectItem, ScaleTable, ScaleTextarea, ScaleTextField } from "@telekom/scale-components-react";
import { useStatus } from "~/Services/Status";
import { EventType } from "../Event/Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function NewForm() {
  const { DB } = useStatus()

  return (
    <form
      autoComplete="off"
      className="flex flex-col gap-y-6 rounded-md bg-white px-8 py-7 shadow-md"
      onSubmit={(e) => { e.preventDefault() }}
    >
      <ScaleTextField
        placeholder="Please give the title of event"
        required
        label="Title"
      />

      <ScaleDropdownSelect
        label="Type"
      >
        {Object.values(EventType).slice(1).map((type, i) =>
          <ScaleDropdownSelectItem value={type} key={i}>
            {type}
          </ScaleDropdownSelectItem>)}
      </ScaleDropdownSelect>

      <ScaleTextarea
        placeholder="If there is any known information, please write it down here."
        resize="vertical"
        label="Description"
      />

      <ScaleTable>
        <div className="max-h-64 overflow-auto">
          <table>
            <caption className="text-left sticky top-0 bg-white">
              Affected Services
            </caption>

            <thead className="sticky top-6">
              <tr>
                <th>Name</th>
                {DB.Regions.map((region, i) => (
                  <th key={i}>{region.Name}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {DB.Services.map((service, i) => (
                <tr key={i}>
                  <td>{service.Name}</td>
                  {DB.Regions.map((_, j) => (
                    <td key={j}>
                      <input type="checkbox" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScaleTable>

      <ScaleTextField
        type="datetime-local"
        label="Start"
        required
      />

      <ScaleTextField
        type="datetime-local"
        label="End"
        required
      />

      <ScaleButton class="self-end" size="small" type="submit">
        Submit
      </ScaleButton>
    </form>
  )
}
