import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { useAccessToken } from "../Auth/useAccessToken";
import { EventStatus, EventType, GetEventImpact, IsIncident } from "../Event/Enums";
import { useRouter } from "../Router";

/**
 * Custom hook to manage the state and validation of a form.
 *
 * This hook provides various state variables and functions to handle
 * form inputs, validation, and submission. It ensures that the form
 * data is properly managed and validated before submission.
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function useNewForm() {
  const { DB, Update } = useStatus();

  const [title, _setTitle] = useState("");
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

    if (IsIncident(value)) {
      _setEnd(undefined);
    }

    return true;
  }

  const [description, _setDescription] = useState("");
  const [valDescription, setValDescription] = useState<string>();
  function setDescription(value = description) {
    let err: boolean = false;

    if (value && (value.length < 10 || value.length > 500)) {
      setValDescription("Description must be between 10 and 500 characters.");
      err = true;
    }

    _setDescription(value);
    if (!err) {
      setValDescription(undefined);
    }
    return !err;
  }

  const [start, _setStart] = useState(new Date());
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

    if (!err) {
      setValStart(undefined);
    }
    _setStart(value);

    return !err;
  }

  const [end, _setEnd] = useState<Date>();
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

  const [services, _setServices] = useState<Models.IRegionService[]>([]);
  const [valServices, setValServices] = useState<string>();
  function setServices(action: (curr: Models.IRegionService[]) => Models.IRegionService[] = (s) => s) {
    const updated = action(services);
    let err: boolean = false;

    if (!updated || !updated.length) {
      setValServices("At least one service is required.");
      err = true;
    }

    _setServices(updated);
    if (!err) {
      setValServices(undefined);
    }
    return !err;
  }

  const { Nav } = useRouter();
  const getToken = useAccessToken();

  const { runAsync, loading } = useRequest(async () => {
    if (![setTitle(), setType(), setDescription(), setStart(), setEnd(), setServices()].every(Boolean)) {
      return;
    }

    const status = IsIncident(type)
      ? EventStatus.Detected : EventStatus.Planned

    const event: Models.IEvent = {
      Id: Math.max(...DB.Events.map(event => event.Id), 0) + 1,
      Title: title,
      Type: type,
      Start: start,
      End: end,
      Status: status,
      RegionServices: new Set(services),
      Histories: new Set(),
      Description: description
    };

    const url = process.env.SD_BACKEND_URL!;

    const body: Record<string, any> = {
      title,
      description,
      type: IsIncident(type) ? "incident" : type === EventType.Maintenance ? "maintenance" : "info",
      impact: GetEventImpact(type),
      components: services.map(s => s.Id),
      start_date: start.toISOString()
    }

    if (!IsIncident(type) && end) {
      body.end_date = end
    }

    const raw = await fetch(`${url}/v2/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });

    const res = await raw.json();
    const id = res.result.at(0)?.incident_id;

    if (id) {
      event.Id = id;
    }

    DB.Events.push(event);
    Update();

    Nav(`/Event/${event.Id}`);
  }, {
    manual: true
  });

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
    OnSubmit: runAsync,
    Loading: loading
  }
}
