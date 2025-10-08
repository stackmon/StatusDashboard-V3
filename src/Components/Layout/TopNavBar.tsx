import { ScaleTelekomHeader, ScaleTelekomNavItem, ScaleTelekomNavList } from "@telekom/scale-components-react";
import { Authorized } from "../Auth/With";
import { MobileMenu } from "./MobileMenu";
import { NavItem } from "./NavItem";
import { ProfileMenu } from "./ProfileMenu";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function TopNavBar() {
  return (
    <ScaleTelekomHeader
      appName="Open Telekom Cloud"
      appNameLink="/"
      logoHref="/"
      slot="header"
      type="slim">

      <ScaleTelekomNavList aria-label="Main Navigation Links" slot="main-nav">
        <NavItem Href="/History" Label="History" />

        <NavItem Href="/Timeline" Label="Timeline" />

        <NavItem Href="/Availability" Label="Availability" />

        <ScaleTelekomNavItem aria-label="Docs">
          <a href="https://docs.otc.t-systems.com/status-dashboard/index.html" target="_black">
            Docs
          </a>
        </ScaleTelekomNavItem>
      </ScaleTelekomNavList>

      <ScaleTelekomNavList alignment="right" aria-label="Functions Menu" slot="functions" variant="functions">
        <Authorized>
          <ProfileMenu />
        </Authorized>
        <MobileMenu />
      </ScaleTelekomNavList>

    </ScaleTelekomHeader>
  );
}
