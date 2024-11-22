import { useState } from "react";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType } from "../Event/Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useNewForm() {
  const { DB, Update } = useStatus();

  const [title, _setTitle] = useState("");
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

  const [type, _setType] = useState(EventType.Maintenance);
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

    _setType(value);
    setValType(undefined);

    return true;
  }

  const [description, _setDescription] = useState("");
  const [valDescription, setValDescription] = useState<string>();
  function setDescription(value = description) {
    let err: boolean = false;

    if (value && (value.length < 10 || value.length > 200)) {
      setValDescription("Description must be between 10 and 200 characters.");
      err = true;
    }

    _setDescription(value);
    !err && setValDescription(undefined);

    return !err;
  }

  const [start, _setStart] = useState(new Date());
  const [valStart, setValStart] = useState<string>();
  function setStart(value = start) {
    let err: boolean = false;

    const now = new Date();
    if (value > end) {
      setValStart("Start Date cannot be later than End Date.");
      err = true;
    }
    if (value > now) {
      setValStart("Start Date cannot be in the future.");
      err = true;
    }

    _setStart(value);
    !err && setValStart(undefined);

    return !err;
  }

  const [end, _setEnd] = useState(new Date());
  const [valEnd, setValEnd] = useState<string>();
  function setEnd(value = end) {
    let err: boolean = false;

    if (value && value < start) {
      setValEnd("End Date cannot be before Start Date.");
      err = true;
    }

    _setStart(value);
    !err && setValEnd(undefined);

    if (type === EventType.Maintenance) {
      return !err;
    }
    return true;
  }

  const [services, _setServices] = useState<Models.IRegionService[]>([]);
  const [valServices, setValServices] = useState<string>();
  function setServices(action: (curr: Models.IRegionService[]) => Models.IRegionService[]) {
    const updated = action(services);
    let err: boolean = false;

    if (!updated || !updated.length) {
      setValServices("At least one service is required.");
      err = true;
    }

    _setServices(updated);
    !err && setValServices(undefined);

    return !err;
  }

  function OnSubmit(close: () => void) {
    if (![setTitle(), setType(), setDescription(), setStart, setEnd()].every(Boolean)) {
      return;
    }

    const event = {
      Id: 0,
      Title: title,
      Type: type,
      End: end,
      Status: type === EventType.Maintenance
        ? EventStatus.Scheduled : EventStatus.Investigating,
      Histories: []
    };

    Update();
    close();
  }

  return {
    State: {
      title,
      type,
      description,
      start,
      end,
      services
    },
    Actions: {
      setTitle,
      setType,
      setDescription,
      setStart,
      setEnd,
      setServices
    },
    Validation: {
      title: valTitle,
      type: valType,
      description: valDescription,
      start: valStart,
      end: valEnd,
      services: valServices
    },
    OnSubmit
  }
}
