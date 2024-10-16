import { ScaleButton, ScaleDropdownSelect, ScaleDropdownSelectItem, ScaleIconActionEdit, ScaleModal, ScaleTextField } from "@telekom/scale-components-react";
import { useBoolean } from "ahooks";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType } from "./Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventEditor({ Event }: { Event: Models.IEvent }) {
  const [open, { setTrue, setFalse }] = useBoolean();

  return <>
    <ScaleButton onClick={setTrue} size="small">
      <ScaleIconActionEdit />
      Edit
    </ScaleButton>

    <ScaleModal
      heading="Edit Event"
      opened={open}
      omitCloseButton
      size="small"
      class="absolute"
      onScale-before-close={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-y-6">
        <ScaleTextField
          inputAutocomplete="off"
          class="w-full"
          placeholder="Please give the title of event"
          required
          label="Title"
        />

        <ScaleDropdownSelect label="Type">
          {Object.values(EventType).slice(1).map((type, i) =>
            <ScaleDropdownSelectItem value={type} key={i}>
              {type}
            </ScaleDropdownSelectItem>)}
        </ScaleDropdownSelect>

        <ScaleDropdownSelect label="Status">
          {Object.values(EventStatus)
            .slice(
              Event.Type === EventType.Maintenance ? 4 : 0,
              Event.Type === EventType.Maintenance ? undefined : 4
            ).map((status, i) =>
              <ScaleDropdownSelectItem value={status} key={i}>
                {status}
              </ScaleDropdownSelectItem>)}
        </ScaleDropdownSelect>

        <div className="flex gap-x-3 self-end">
          <ScaleButton onClick={setFalse} variant="secondary">
            Cancel
          </ScaleButton>

          <ScaleButton>
            Submit
          </ScaleButton>
        </div>
      </div>
    </ScaleModal>
  </>;
}
