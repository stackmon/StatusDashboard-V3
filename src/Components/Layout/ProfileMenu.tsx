import { ODSBadgeNumber } from "@telekom-ods/react-ui-kit";
import { ScaleButton, ScaleIconUserFileUser, ScaleMenuFlyout, ScaleMenuFlyoutItem, ScaleMenuFlyoutList, ScaleTelekomNavItem } from "@telekom/scale-components-react";
import { useAuth } from "react-oidc-context";
import { Authorized } from "../Auth/With";

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

        <div slot="trigger" className="relative">
          <ScaleButton variant="secondary" iconOnly>
            <ScaleIconUserFileUser accessibility-title="Menu" />
          </ScaleButton>

          <Authorized>
            <div className="absolute -top-1 -right-1">
              <ODSBadgeNumber
                notificationNumber={6}
                size="standard"
                variant="notification"
              />
            </div>
          </Authorized>
        </div>

        <ScaleMenuFlyoutList>
          <ScaleMenuFlyoutItem>
            Hi, {auth.user?.profile.name}
          </ScaleMenuFlyoutItem>

          <ScaleMenuFlyoutItem>
            <a href="/NewEvent">
              New Event
            </a>
          </ScaleMenuFlyoutItem>

          <ScaleMenuFlyoutItem>
            <a href="/Reviews">
              Reviews
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
