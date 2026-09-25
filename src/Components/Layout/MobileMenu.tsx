import { ScaleIconActionMenu, ScaleTelekomMobileFlyoutCanvas, ScaleTelekomMobileMenu, ScaleTelekomMobileMenuItem, ScaleTelekomNavFlyout, ScaleTelekomNavItem } from "@telekom/scale-components-react";
import { chain } from "lodash";
import { useMemo, useRef, type MouseEvent } from "react";
import { useAuth } from "react-oidc-context";
import { EventStatus } from "~/Components/Event/Enums";
import { useStatus } from "~/Services/Status";
import { Authorized, CanApprove } from "../Auth/With";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.3.0
 */
export function MobileMenu() {
  const auth = useAuth();
  const { DB } = useStatus();
  const flyoutRef = useRef<HTMLScaleTelekomNavFlyoutElement>(null);

  const pendingCount = useMemo(() => chain(DB.Events)
    .filter(e => e.Status === EventStatus.PendingReview)
    .value().length, [DB]);

  /**
   * Defensive fallback for `scale-telekom-nav-flyout` (3.0.0-beta.161): its
   * `connectedCallback` used to assign a private `parentElement` field, which
   * hits the readonly `Node.parentElement` getter, aborts the callback and
   * leaves the trigger without `aria-haspopup` and without a click listener, so
   * the flyout never opens. `patches/` fixes that in the shipped source, which
   * makes the guard below short-circuit; the manual toggle keeps the menu
   * usable if the patch is ever dropped or lost on a Scale upgrade.
   */
  const toggleFlyout = (event: MouseEvent<HTMLButtonElement>) => {
    const flyout = flyoutRef.current;

    if (!flyout || event.currentTarget.hasAttribute("aria-haspopup")) {
      return;
    }

    flyout.expanded = !flyout.expanded;
  };

  return (
    <ScaleTelekomNavItem hideOnDesktop>
      <button onClick={toggleFlyout}>
        <ScaleIconActionMenu accessibility-title="Menu" />
      </button>

      <ScaleTelekomNavFlyout ref={flyoutRef}>
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

              <Authorized rules={(roles) => {
                return pendingCount > 0 && CanApprove(roles);
              }}>
                <ScaleTelekomMobileMenuItem>
                  <a href="/Reviews">Reviews: {pendingCount}</a>
                </ScaleTelekomMobileMenuItem>
              </Authorized>

              <ScaleTelekomMobileMenuItem onScaleSetMenuItemActive={() => auth.signoutRedirect()}>
                Logout {auth.user?.profile.name || auth.user?.profile.preferred_username}
              </ScaleTelekomMobileMenuItem>
            </Authorized>
          </ScaleTelekomMobileMenu>
        </ScaleTelekomMobileFlyoutCanvas>
      </ScaleTelekomNavFlyout>
    </ScaleTelekomNavItem>
  );
}
