import { useState } from "react";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType } from "./Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useEventForm(event: Models.IEvent) {
  const { Update } = useStatus();

  const [title, _setTitle] = useState(event.Title);
  const [valTitle, setValTitle] = useState<string>();
  function setTitle(value = title) {
    let err: boolean = false;

    if (value.length < 8 || value.length > 200) {
      setValTitle("Title must be between 8 and 200 characters.");
      err = true;
    }

    if (!value) {
      setValTitle("Title is required.");
      err = true;
    }

    _setTitle(value);
    !err && setValTitle(undefined);

    return !err;
  }

  const [type, _setType] = useState(event.Type);
  const [valType, setValType] = useState<string>();
  function setType(value = type) {
    if (!value) {
      setValType("Type is required.");
      return false;
    }

    if (!Object.values(EventType).includes(value)) {
      setValType("Invalid event type.");
      return false;
    }

    if (type === EventType.Maintenance && value !== EventType.Maintenance) {
      _setStatus(EventStatus.Investigating);
    }

    if (type !== EventType.Maintenance && value === EventType.Maintenance) {
      _setStatus(EventStatus.Scheduled);
    }

    _setType(value);
    setValType(undefined);

    return true;
  }

  const [update, _setUpdate] = useState("");
  const [valUpdate, setValUpdate] = useState<string>();
  function setUpdate(value = update) {
    let err: boolean = false;

    if (value.length < 10 || value.length > 200) {
      setValUpdate("Update Message must be between 10 and 200 characters.");
      err = true;
    }

    if (!value) {
      setValUpdate("Update Message is required.");
      err = true;
    }

    _setUpdate(value);
    !err && setValUpdate(undefined);

    return !err;
  }

  const [status, _setStatus] = useState(event.Status);
  const [valStatus, setValStatus] = useState<string>();
  function setStatus(value = status) {
    if (!value) {
      setValStatus("Status is required.");
      return false;
    }

    if (!Object.values(EventStatus).includes(value)) {
      setValStatus("Invalid event status.");
      return false;
    }

    _setStatus(value);
    setValStatus(undefined);

    return true;
  }

  const [end, _setEnd] = useState(event.End);
  const [valEnd, setValEnd] = useState<string>();
  function setEnd(value = end) {
    let err: boolean = false;

    if (value && value < event.Start) {
      setValEnd("End Date cannot be before Start Date.");
      err = true;
    }

    _setEnd(value);
    !err && setValEnd(undefined);

    if (type === EventType.Maintenance) {
      return !err;
    }
    return true;
  }

  function OnSubmit(close: () => void) {
    if (![setTitle(), setType(), setUpdate(), setStatus(), setEnd()].every(Boolean)) {
      return;
    }

    event.Title = title;
    event.Type = type;

    const maxId = Math.max(...[...event.Histories].map(history => history.Id), 0);
    event.Histories.add({
      Id: maxId + 1,
      Message: update,
      Created: new Date(),
      Status: status,
      Event: event
    });

    event.Status = status;
    event.End = end;

    Update();
    close();
  }

  return {
    State: {
      title,
      type,
      update,
      status,
      end
    },
    Actions: {
      setTitle,
      setType,
      setUpdate,
      setStatus,
      setEnd
    },
    Validation: {
      title: valTitle,
      type: valType,
      update: valUpdate,
      status: valStatus,
      end: valEnd
    },
    OnSubmit
  }
}
