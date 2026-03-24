import { ScaleIconActionMenu, ScaleTelekomMobileFlyoutCanvas, ScaleTelekomMobileMenu, ScaleTelekomMobileMenuItem, ScaleTelekomNavFlyout, ScaleTelekomNavItem } from "@telekom/scale-components-react";
import { useAuth } from "react-oidc-context";
import { Authorized } from "../Auth/With";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function MobileMenu() {
  const auth = useAuth();

  return (
    <ScaleTelekomNavItem hideOnDesktop>
      <button>
        <ScaleIconActionMenu accessibility-title="Menu" />
      </button>

      <ScaleTelekomNavFlyout>
        <ScaleTelekomMobileFlyoutCanvas>
          <ScaleTelekomMobileMenu slot="mobile-main-nav">

            <ScaleTelekomMobileMenuItem>
              <a href="/History">History</a>
            </ScaleTelekomMobileMenuItem>

            <ScaleTelekomMobileMenuItem>
              <a href="/Availability">Availability</a>
            </ScaleTelekomMobileMenuItem>

            <ScaleTelekomMobileMenuItem>
              <a href="https://docs.otc.t-systems.com/status-dashboard/index.html" target="_black">
                Docs
              </a>
            </ScaleTelekomMobileMenuItem>

            <Authorized>
              <ScaleTelekomMobileMenuItem>
                <a href="/NewEvent">New Event</a>
              </ScaleTelekomMobileMenuItem>

              <ScaleTelekomMobileMenuItem>
                <a href="/Reviews">Reviews: 6</a>
              </ScaleTelekomMobileMenuItem>

              <ScaleTelekomMobileMenuItem>
                You're {((auth.user?.profile as any)?.groups as string[])?.filter(x => x.includes("sd"))}
              </ScaleTelekomMobileMenuItem>

              <ScaleTelekomMobileMenuItem onScale-set-menu-item-active={() => auth.signoutSilent()}>
                Logout {auth.user?.profile.name}
              </ScaleTelekomMobileMenuItem>
            </Authorized>
          </ScaleTelekomMobileMenu>
        </ScaleTelekomMobileFlyoutCanvas>
      </ScaleTelekomNavFlyout>
    </ScaleTelekomNavItem>
  );
}
