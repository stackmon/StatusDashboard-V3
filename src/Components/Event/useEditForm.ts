import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { StatusEnum } from "~/Services/Status.Entities";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType, GetEventImpact, GetStatusString, IsOpenStatus } from "./Enums";

/**
 * Custom hook for managing the edit form state and validation for an event.
 *
 * This hook provides state management and validation for various fields of an event,
 * including title, type, update message, status, and end date. It also includes a
 * submission handler to update the event and close the form.
 *
 * @param {Models.IEvent} event - The event object to be edited.
 *
 * @returns An object containing the state, actions, validation messages,
 * and submission handler for the edit form.
 *
 * @property {Function} OnSubmit - Function to handle form submission, update the event,
 * and close the form.
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useEditForm(event: Models.IEvent) {
  const [title, _setTitle] = useState(event.Title);
  const [valTitle, setValTitle] = useState<string>();
  function setTitle(value = title) {
    let err: boolean = false;

    if (value.length < 8 || value.length > 100) {
      setValTitle("Title must be between 8 and 100 characters.");
      err = true;
    }

    if (!value) {
      setValTitle("Title is required.");
      err = true;
    }

    _setTitle(value);
    if (!err) {
      setValTitle(undefined);
    }

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
      _setStatus(EventStatus.Analysing);
    }

    if (type !== EventType.Maintenance && value === EventType.Maintenance) {
      _setStatus(EventStatus.Modified);
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
    if (!err) {
      setValUpdate(undefined);
    }

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

  const [start, _setStart] = useState(event.Start);
  const [valStart, setValStart] = useState<string>();
  function setStart(value = start) {
    let err: boolean = false;

    const now = new Date();
    if (end && value > end) {
      setValStart("Start Date cannot be later than End Date.");
      err = true;
    }
    if (value > now) {
      setValStart("Start Date cannot be in the future.");
      err = true;
    }

    if (!err) {
      setValStart(undefined);
    }
    _setStart(value);

    return !err;
  }

  const [end, _setEnd] = useState<Date | undefined>(event.End);
  const [valEnd, setValEnd] = useState<string>();
  function setEnd(value = end) {
    let err: boolean = false;

    if (value && value < start) {
      setValEnd("End Date cannot be before Start Date.");
      err = true;
    }

    if (!err) {
      setValEnd(undefined);
    }
    _setEnd(value);

    return !err;
  }

  useEffect(() => {
    setStart();
    setEnd();
  }, [start, end]);

  const { user } = useAuth();

  const { runAsync, loading } = useRequest(async () => {
    if (![setTitle(), setType(), setUpdate(), setStatus(), setStart, setEnd()].every(Boolean)) {
      throw new Error("Validation failed.");
    }

    const url = process.env.SD_BACKEND_URL!;

    const body: Record<string, any> = {
      title,
      status: GetStatusString(status),
      impact: GetEventImpact(type),
      message: update,
      update_date: new Date().toISOString(),
    };

    if (event.Type !== type) {
      body.status = StatusEnum.ImpactChanged;
    }

    if (!IsOpenStatus(event.Status) && event.Type !== EventType.Maintenance) {
      if (event.Status !== status) {
        body.status = StatusEnum.Reopened;
      } else {
        body.start_date = start.toISOString();
        body.status = StatusEnum.Changed;
      }
    }

    if (event.Type === EventType.Maintenance) {
      body.start_date = start.toISOString();
    }

    if (end && !isNaN(end.getTime())) {
      body.end_date = end.toISOString();
    }

    const raw = await fetch(`${url}/v2/incidents/${event.Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.access_token}`
      },
      body: JSON.stringify(body)
    });

    if (!raw.ok) {
      throw new Error("Failed to update event: " + await raw.text());
    }

    window.location.reload();
  }, {
    manual: true
  });

  return {
    State: {
      title,
      type,
      update,
      status,
      start,
      end
    },
    Actions: {
      setTitle,
      setType,
      setUpdate,
      setStatus,
      setStart,
      setEnd
    },
    Validation: {
      title: valTitle,
      type: valType,
      update: valUpdate,
      status: valStatus,
      start: valStart,
      end: valEnd
    },
    OnSubmit: runAsync,
    Loading: loading
  }
}
