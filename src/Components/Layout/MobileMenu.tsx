import { ScaleIconActionMenu, ScaleTelekomMobileFlyoutCanvas, ScaleTelekomMobileMenu, ScaleTelekomMobileMenuItem, ScaleTelekomNavFlyout, ScaleTelekomNavItem } from "@telekom/scale-components-react";
import { chain } from "lodash";
import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { EventStatus } from "~/Components/Event/Enums";
import { useStatus } from "~/Services/Status";
import { Authorized, Roles } from "../Auth/With";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.3.0
 */
export function MobileMenu() {
  const auth = useAuth();
  const { DB } = useStatus();

  const pendingCount = useMemo(() => chain(DB.Events)
    .filter(e => e.Status === EventStatus.PendingReview)
    .value().length, [DB]);

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

              <Authorized rules={(groups) => {
                return pendingCount > 0 &&
                  groups.some(g => g === Roles.Operators || g === Roles.Admins);
              }}>
                <ScaleTelekomMobileMenuItem>
                  <a href="/Reviews">Reviews: {pendingCount}</a>
                </ScaleTelekomMobileMenuItem>
              </Authorized>

              <ScaleTelekomMobileMenuItem>
                You're {((auth.user?.profile as any)?.groups as string[])?.filter(x => x.includes("sd"))}
              </ScaleTelekomMobileMenuItem>

              <ScaleTelekomMobileMenuItem onScale-set-menu-item-active={() => auth.signoutSilent()}>
                Logout {auth.user?.profile.name || auth.user?.profile.preferred_username}
              </ScaleTelekomMobileMenuItem>
            </Authorized>
          </ScaleTelekomMobileMenu>
        </ScaleTelekomMobileFlyoutCanvas>
      </ScaleTelekomNavFlyout>
    </ScaleTelekomNavItem>
  );
}
