import { useState } from "react";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType } from "./Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useEventForm(event: Models.IEvent) {
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
  }

  const [type, _setType] = useState(event.Type);
  const [valType, setValType] = useState<string>();
  function setType(value = type) {
    if (!value) {
      setValType("Type is required.");
      return;
    }

    if (!Object.values(EventType).includes(value)) {
      setValType("Invalid event type.");
      return;
    }

    _setType(value);
    setValType(undefined);
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
  }

  const [status, _setStatus] = useState(event.Status);
  const [valStatus, setValStatus] = useState<string>();
  function setStatus(value = status) {
    if (!value) {
      setValStatus("Status is required.");
      return;
    }

    if (!Object.values(EventStatus).includes(value)) {
      setValStatus("Invalid event status.");
      return;
    }

    _setStatus(value);
    setValStatus(undefined);
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
    }
  }
}
