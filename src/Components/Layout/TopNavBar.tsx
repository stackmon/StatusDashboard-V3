import { ScaleTelekomHeader, ScaleTelekomNavItem, ScaleTelekomNavList } from "@telekom/scale-components-react";
import { Dic } from "~/Helpers/Entities";
import { Authorized } from "../Auth/With";
import { MobileMenu } from "./MobileMenu";
import { NavItem } from "./NavItem";
import { ProfileMenu } from "./ProfileMenu";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function TopNavBar() {
  return (
    <ScaleTelekomHeader
      appName={Dic.Name}
      appNameLink="/"
      logoHref="/"
      slot="header"
      type="slim">

      <ScaleTelekomNavList aria-label="Main Navigation Links" slot="main-nav">
        <NavItem Href="/History" Label="History" />

        <NavItem Href="/Availability" Label="Availability" />

        <ScaleTelekomNavItem aria-label="Docs">
          <a href="https://docs.otc.t-systems.com/status-dashboard/index.html" target="_black">
            Docs
          </a>
        </ScaleTelekomNavItem>

        <Authorized>
          <NavItem Href="/NewEvent" Label="New Event" />

          <NavItem Href="/Reviews" Label="Reviews" />
        </Authorized>
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
