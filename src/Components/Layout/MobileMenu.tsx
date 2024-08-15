import { ScaleIconActionMenu, ScaleTelekomMobileFlyoutCanvas, ScaleTelekomMobileMenu, ScaleTelekomMobileMenuItem, ScaleTelekomNavFlyout, ScaleTelekomNavItem } from "@telekom/scale-components-react";
import { useAuth } from "react-oidc-context";
import { Authorized, NotAuthorized } from "../Auth/With";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
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

              <ScaleTelekomMobileMenuItem onScale-set-menu-item-active={() => auth.signoutRedirect()}>
                Logout {auth.user?.profile.name}
              </ScaleTelekomMobileMenuItem>
            </Authorized>

            <NotAuthorized>
              <ScaleTelekomMobileMenuItem onScale-set-menu-item-active={() => auth.signinRedirect()}>
                Login
              </ScaleTelekomMobileMenuItem>
            </NotAuthorized>

          </ScaleTelekomMobileMenu>
        </ScaleTelekomMobileFlyoutCanvas>
      </ScaleTelekomNavFlyout>
    </ScaleTelekomNavItem>
  );
}
