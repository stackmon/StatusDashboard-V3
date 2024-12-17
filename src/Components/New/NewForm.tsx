import { ScaleButton, ScaleDropdownSelect, ScaleDropdownSelectItem, ScaleHelperText, ScaleTable, ScaleTextarea, ScaleTextField } from "@telekom/scale-components-react";
import { useStatus } from "~/Services/Status";
import { EventType } from "../Event/Enums";
import { useNewForm } from "./useNewForm";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function NewForm() {
  const { DB } = useStatus();
  const { State, Actions, Validation, OnSubmit } = useNewForm();

  return (
    <form
      autoComplete="off"
      className="flex flex-col gap-y-6 rounded-md bg-white px-8 py-7 shadow-md"
      onSubmit={(e) => {
        e.preventDefault();
        OnSubmit();
      }}
    >
      <ScaleTextField
        placeholder="Please give the title of event"
        required
        label="Title"
        value={State.title}
        onScale-input={(e) => Actions.setTitle(e.target.value as string)}
        invalid={!!Validation.title}
        helperText={Validation.title}
      />

      <ScaleDropdownSelect
        label="Type"
        value={State.type}
        onScale-change={(e) => Actions.setType(e.target.value as EventType)}
        invalid={!!Validation.type}
        helperText={Validation.type}
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
        value={State.description}
        onScale-input={(e) => Actions.setDescription(e.target.value as string)}
        invalid={!!Validation.description}
        helperText={Validation.description}
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
                  {DB.Regions.map((region, j) => {
                    const rs = DB.RegionService.find(rs => rs.Service === service && rs.Region === region);

                    return (
                      <td key={j}>
                        <input
                          type="checkbox"
                          disabled={!rs}
                          onChange={(e) => {
                            const checked = e.target.checked;

                            Actions.setServices((curr) => {
                              if (checked) {
                                return [...curr, rs!];
                              }

                              return curr.filter(s => s !== rs);
                            })
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ScaleHelperText
          variant={Validation.services ? "danger" : "informational"}
          helperText={Validation.services || `Selected ${State.services.length} services`}
        />
      </ScaleTable>

      <ScaleTextField
        type="datetime-local"
        label="Start"
        required
        value={State.start?.toISOString().slice(0, 16)}
        onScale-input={(e) => Actions.setStart(new Date(e.target.value as string))}
        invalid={!!Validation.start}
        helperText={Validation.start}
      />

      <ScaleTextField
        type="datetime-local"
        label="End"
        required
        value={State.end?.toISOString().slice(0, 16)}
        onScale-input={(e) => Actions.setEnd(new Date(e.target.value as string))}
        invalid={!!Validation.end}
        helperText={Validation.end}
      />

      <ScaleButton class="self-end" size="small" type="submit">
        Submit
      </ScaleButton>
    </form>
  )
}
