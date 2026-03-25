import { ScaleButton, ScaleIconActionCheckmark } from "@telekom/scale-components-react";
import { useRequest } from "ahooks";
import { useAccessToken } from "../Auth/useAccessToken";

/**
 * @author Aloento
 * @since 1.5.0
 * @version 0.1.0
 */
export function EventApprove({ EventId }: { EventId: number }) {
  const getToken = useAccessToken();

  const { runAsync, loading } = useRequest(async () => {
    const url = process.env.SD_BACKEND_URL!;
    const raw = await fetch(`${url}/v2/events/${EventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        status: "reviewed",
        message: "Approved by operator",
        update_date: new Date().toISOString(),
      }),
    });

    if (!raw.ok) {
      throw new Error("Failed to approve event: " + await raw.text());
    }

    window.location.reload();
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
