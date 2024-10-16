import { ScaleButton, ScaleIconActionEdit, ScaleModal, ScaleTextField } from "@telekom/scale-components-react";
import { useBoolean } from "ahooks";
import { Models } from "~/Services/Status.Models";

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
    >
      <ScaleTextField
        inputAutocomplete="off"
        class="w-full"
        placeholder="Please give the title of event"
        required
      />

    </ScaleModal>
  </>;
}
