import { ScaleButton, ScaleIconUserFileUser, ScaleMenuFlyout, ScaleMenuFlyoutItem, ScaleMenuFlyoutList, ScaleTelekomNavItem } from "@telekom/scale-components-react";
import { useAuth } from "react-oidc-context";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function ProfileMenu() {
  const auth = useAuth();

  return (
    <ScaleTelekomNavItem hideOnMobile>
      <ScaleMenuFlyout>

        <ScaleButton slot="trigger" variant="secondary" iconOnly>
          <ScaleIconUserFileUser accessibility-title="Menu" />
        </ScaleButton>

        <ScaleMenuFlyoutList>
          <ScaleMenuFlyoutItem>
            Hi, {auth.user?.profile.name}
          </ScaleMenuFlyoutItem>

          <ScaleMenuFlyoutItem>
            <a className="text-black no-underline" href="/NewEvent">
              New Event
            </a>
          </ScaleMenuFlyoutItem>

          <ScaleMenuFlyoutItem onScale-select={() => auth.signoutSilent()}>
            Logout
          </ScaleMenuFlyoutItem>
        </ScaleMenuFlyoutList>

      </ScaleMenuFlyout>
    </ScaleTelekomNavItem>
  );
}
