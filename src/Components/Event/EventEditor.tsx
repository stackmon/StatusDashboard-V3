import { ScaleButton, ScaleDropdownSelect, ScaleDropdownSelectItem, ScaleIconActionEdit, ScaleModal, ScaleTextarea, ScaleTextField } from "@telekom/scale-components-react";
import { useBoolean } from "ahooks";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType } from "./Enums";
import { useEditForm } from "./useEditForm";

/**
 * The `EventEditor` component is a versatile and dynamic component designed to handle the editing of events.
 * It provides a user interface for modifying event details, including title, type, status, and update message.
 *
 * This component leverages various hooks and state management techniques to ensure a seamless and responsive user experience.
 *
 * @param {Models.IEvent} props.Event - The event object to be edited.
 *
 * @remarks
 * The `EventEditor` component is highly customizable and can be adapted to various use cases.
 * It includes form validation and handles user input efficiently.
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventEditor({ Event }: { Event: Models.IEvent }) {
  const { State, Actions, Validation, OnSubmit } = useEditForm(Event);
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
      <form
        className="flex flex-col gap-y-6"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          OnSubmit(setFalse);
        }}>
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

        <ScaleDropdownSelect
          label="Status"
          value={State.status}
          onScale-change={(e) => Actions.setStatus(e.target.value as EventStatus)}
          invalid={!!Validation.status}
          helperText={Validation.status}
        >
          {Object.values(EventStatus)
            .slice(
              State.type === EventType.Maintenance ? 4 : 0,
              State.type === EventType.Maintenance ? undefined : 4
            ).map((status, i) =>
              <ScaleDropdownSelectItem value={status} key={i}>
                {status}
              </ScaleDropdownSelectItem>)}
        </ScaleDropdownSelect>

        {State.type === EventType.Maintenance &&
          <ScaleTextField
            type="datetime-local"
            label="(Plan) End"
            required
            value={State.end?.toISOString().slice(0, 16)}
            onScale-input={(e) => Actions.setEnd(new Date(e.target.value as string))}
            invalid={!!Validation.end}
            helperText={Validation.end}
          />}

        <ScaleTextarea
          label="Update Message"
          resize="vertical"
          value={State.update}
          onScale-input={(e) => Actions.setUpdate(e.target.value as string)}
          invalid={!!Validation.update}
          helperText={Validation.update}
        />

        <div className="flex gap-x-3 self-end">
          <ScaleButton onClick={setFalse} variant="secondary">
            Cancel
          </ScaleButton>

          <ScaleButton type="submit">
            Submit
          </ScaleButton>
        </div>
      </form>
    </ScaleModal>
  </>;
}
