import { useRequest } from "ahooks";
import { useState } from "react";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { useAccessToken } from "../Auth/useAccessToken";
import { useRouter } from "../Router";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function useEventExtract(event: Models.IEvent) {
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
    !err && setValServices(undefined);

    return !err;
  }

  const getToken = useAccessToken();
  const { Nav } = useRouter();
  const { Refresh } = useStatus();

  const { runAsync, loading } = useRequest(async () => {
    if (!setServices()) {
      return false;
    }

    const url = process.env.SD_BACKEND_URL!;

    const body: Record<string, any> = {
      components: services.map(s => s.Id),
    }

    const raw = await fetch(`${url}/v2/incidents/${event.Id}/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });

    const res = await raw.json();
    const id = res.id;

    if (id) {
      await Refresh();
      Nav(`/Event/${id}`);
    }

    return true;
  }, {
    manual: true
  });

  return {
    services,
    setServices,
    valServices,
    OnSubmit: runAsync,
    Loading: loading
  }
}
