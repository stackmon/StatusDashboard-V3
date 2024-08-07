import { ScaleTelekomHeader, ScaleTelekomNavItem, ScaleTelekomNavList } from "@telekom/scale-components-react";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
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
        <NavItem href="/History" Label="History" />

        <NavItem href="/Availability" Label="Availability" />

        <ScaleTelekomNavItem aria-label="Docs">
          <a href="https://docs.otc.t-systems.com/status-dashboard/index.html" target="_black">
            Docs
          </a>
        </ScaleTelekomNavItem>
      </ScaleTelekomNavList>

      <ScaleTelekomNavList alignment="right" aria-label="Functions Menu" slot="functions" variant="functions">
        <ProfileMenu />
        <MobileMenu />
      </ScaleTelekomNavList>

    </ScaleTelekomHeader>
  );
}
