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

        <div slot="trigger" className="relative">
          <ScaleButton variant="secondary" iconOnly>
            <ScaleIconUserFileUser accessibility-title="Menu" />
          </ScaleButton>
        </div>

        <ScaleMenuFlyoutList>
          <ScaleMenuFlyoutItem>
            Hi, {auth.user?.profile.name}
          </ScaleMenuFlyoutItem>

          <ScaleMenuFlyoutItem>
            You're {((auth.user?.profile as any)?.groups as string[])?.filter(x => x.includes("sd"))}
          </ScaleMenuFlyoutItem>

          <ScaleMenuFlyoutItem onScale-select={() => auth.signoutSilent()}>
            Logout
          </ScaleMenuFlyoutItem>
        </ScaleMenuFlyoutList>

      </ScaleMenuFlyout>
    </ScaleTelekomNavItem>
  );
}
