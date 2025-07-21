import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useStatus } from "~/Services/Status";
import { StatusEnum } from "~/Services/Status.Entities";
import { Models } from "~/Services/Status.Models";
import { useAccessToken } from "../Auth/useAccessToken";
import { EventStatus, EventType, GetEventImpact, GetStatusString, IsIncident, IsOpenStatus } from "./Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.1
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

    if (type !== value) {
      _setStatus(undefined);
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

  const [status, _setStatus] = useState<EventStatus | undefined>();
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
    if (value > now && IsIncident(type)) {
      setValStart("Start Date cannot be in the future.");
      err = true;
    }

    !err && setValStart(undefined);
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

    !err && setValEnd(undefined);
    _setEnd(value);

    return !err;
  }

  const [updateAt, _setUpdateAt] = useState<Date>(new Date());
  const [valUpdateAt, setValUpdateAt] = useState<string>();
  function setUpdateAt(value = updateAt) {
    let err: boolean = false;

    if (type !== EventType.Maintenance && value && value < start) {
      setValUpdateAt("Update Date cannot be earlier than Start Date.");
      err = true;
    }

    !err && setValUpdateAt(undefined);
    _setUpdateAt(value);

    return !err;
  }

  useEffect(() => {
    setStart();
    setEnd();
  }, [start, end]);

  const getToken = useAccessToken();
  const { DB, Update } = useStatus();

  const { runAsync, loading } = useRequest(async () => {
    if (![setTitle(), setType(), setUpdate(), setStatus(), setStart(), setEnd(), setUpdateAt()].every(Boolean)) {
      throw new Error("Validation failed.");
    }
    const url = process.env.SD_BACKEND_URL!;

    const body: Record<string, any> = {
      title,
      status: GetStatusString(status!),
      impact: GetEventImpact(type),
      message: update,
      update_date: updateAt.toISOString(),
    };

    if (event.Type !== type) {
      body.status = StatusEnum.ImpactChanged;
    }

    if (!IsIncident(event.Type)) {
      body.start_date = start.toISOString();
    }

    if (end && !isNaN(end.getTime())) {
      body.end_date = end.toISOString();
    }

    if (!IsOpenStatus(event.Status) && IsIncident(event.Type)) {
      if (event.Status !== status) {
        body.end_date = undefined;
        body.status = StatusEnum.Reopened;
      } else {
        body.start_date = start.toISOString();
        body.status = StatusEnum.Changed;
      }
    }

    const raw = await fetch(`${url}/v2/incidents/${event.Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });

    if (!raw.ok) {
      throw new Error("Failed to update event: " + await raw.text());
    }

    const eventIndex = DB.Events.findIndex(e => e.Id === event.Id);
    if (eventIndex !== -1) {
      const updatedEvent = { ...DB.Events[eventIndex] };
      updatedEvent.Title = title;
      updatedEvent.Type = type;
      updatedEvent.Status = status!;
      updatedEvent.Start = start;
      updatedEvent.End = end;

      const newHistory: Models.IHistory = {
        Id: Math.max(...Array.from(updatedEvent.Histories).map(h => h.Id), 0) + 1,
        Message: update,
        Created: updateAt,
        Status: status!,
        Event: updatedEvent
      };
      updatedEvent.Histories.add(newHistory);

      DB.Events[eventIndex] = updatedEvent;
      Update();
    }
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
      end,
      updateAt,
    },
    Actions: {
      setTitle,
      setType,
      setUpdate,
      setStatus,
      setStart,
      setEnd,
      setUpdateAt,
    },
    Validation: {
      title: valTitle,
      type: valType,
      update: valUpdate,
      status: valStatus,
      start: valStart,
      end: valEnd,
      updateAt: valUpdateAt,
    },
    OnSubmit: runAsync,
    Loading: loading
  }
}
