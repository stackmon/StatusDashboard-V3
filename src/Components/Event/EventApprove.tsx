import { ScaleButton, ScaleIconActionCheckmark } from "@telekom/scale-components-react";
import { useRequest } from "ahooks";
import { useAuth } from "react-oidc-context";
import { ApiError, getUserFriendlyMessage } from "~/Helpers/ApiError";
import { fetchPlus } from "~/Helpers/fetchPlus";
import { useAppToast } from "~/Helpers/useAppToast";
import { useStatus } from "~/Services/Status";
import { StatusEnum } from "~/Services/Status.Entities";
import { Models } from "~/Services/Status.Models";
import { useAccessToken } from "../Auth/useAccessToken";
import { EventStatus } from "./Enums";

/**
 * @author Aloento
 * @since 1.5.0
 * @version 0.2.3
 */
export function EventApprove({ Event }: { Event: Models.IEvent }) {
  const { Update } = useStatus();

  const getToken = useAccessToken();
  const { user } = useAuth();
  const toast = useAppToast();

  const { runAsync, loading } = useRequest(async () => {
    const url = process.env.SD_BACKEND_URL!;
    const version = Event.Version ?? Event.Histories.size + 1;
    const message = `Approved by ${user?.profile.name || user?.profile.preferred_username}`;

    await fetchPlus.patchJson(`${url}/v2/events/${Event.Id}`, {
      status: StatusEnum.Reviewed,
      version,
      message,
      update_date: new Date().toISOString(),
    }, { token: await getToken() });

    Event.Status = EventStatus.Reviewed;
    Event.Version = version + 1;
    Event.Histories.add({
      Id: Event.Histories.size + 1,
      Created: new Date(),
      Event,
      Message: message,
      Status: EventStatus.Reviewed,
    });
    Update();
  }, {
    manual: true,
    onError: (err) => {
      const apiError = err instanceof ApiError ? err : ApiError.fromNetwork(err);
      toast.showError("Failed to approve event", { body: getUserFriendlyMessage(apiError) });
    },
  });

  return (
    <ScaleButton
      size="small"
      variant="secondary"
      disabled={loading}
      onClick={() => { runAsync().catch(() => { /* already reported through onError */ }); }}
    >
      <ScaleIconActionCheckmark />
      &nbsp;Approve
    </ScaleButton>
  );
}
