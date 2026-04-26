import { Toast, ToastBody, ToastTitle, useToastController } from "@fluentui/react-components";
import { ScaleButton, ScaleIconActionCheckmark } from "@telekom/scale-components-react";
import { useRequest } from "ahooks";
import { useAuth } from "react-oidc-context";
import { useStatus } from "~/Services/Status";
import { StatusEnum } from "~/Services/Status.Entities";
import { Models } from "~/Services/Status.Models";
import { useAccessToken } from "../Auth/useAccessToken";
import { EventStatus } from "./Enums";

/**
 * @author Aloento
 * @since 1.5.0
 * @version 0.2.2
 */
export function EventApprove({ Event }: { Event: Models.IEvent }) {
  const { Update } = useStatus();

  const getToken = useAccessToken();
  const { user } = useAuth();
  const { dispatchToast } = useToastController();

  const { runAsync, loading } = useRequest(async () => {
    const url = process.env.SD_BACKEND_URL!;
    const raw = await fetch(`${url}/v2/events/${Event.Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        status: StatusEnum.Reviewed,
        version: Event.Version ?? Event.Histories.size + 1,
        message: `Approved by ${user?.profile.name}`,
        update_date: new Date().toISOString(),
      }),
    });

    if (!raw.ok) {
      const message = await raw.text();
      dispatchToast(
        <Toast>
          <ToastTitle>Failed to approve event</ToastTitle>
          <ToastBody>{message}</ToastBody>
        </Toast>,
        { intent: "warning" }
      );
      throw new Error("Failed to approve event: " + message);
    }

    Event.Status = EventStatus.Reviewed;
    Event.Histories.add({
      Id: Event.Histories.size + 1,
      Created: new Date(),
      Event,
      Message: `Approved by ${user?.profile.name}`,
      Status: EventStatus.Reviewed,
    });
    Update();
  }, {
    manual: true,
  });

  return (
    <ScaleButton
      size="small"
      variant="secondary"
      disabled={loading}
      onClick={() => runAsync()}
    >
      <ScaleIconActionCheckmark />
      &nbsp;Approve
    </ScaleButton>
  );
}
