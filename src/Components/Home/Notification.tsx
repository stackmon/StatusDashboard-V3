import { ScaleNotification } from "@telekom/scale-components-react";
import { useEffect, useRef, type ComponentProps, type ComponentRef } from "react";

type Element = ComponentRef<typeof ScaleNotification>;

/**
 * @author Aloento
 * @since 1.6.0
 * @version 0.1.0
 */
export function Notification({ opened, ...props }: ComponentProps<typeof ScaleNotification>) {
  const ref = useRef<Element>(null);

  useEffect(() => {
    if (!opened) return;

    (ref.current as (Element & { open?: () => void }) | null)?.open?.();
  }, [opened]);

  return <ScaleNotification {...props} opened={opened} ref={ref} />;
}
