import { ScaleTelekomNavItem } from "@telekom/scale-components-react";
import { useRouter } from "../Router";

interface INavItem {
  Href: string;
  Label: string;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function NavItem({ Href, Label }: INavItem) {
  const { Paths } = useRouter();
  const path = Paths.at(0);

  return (
    <ScaleTelekomNavItem aria-label={Label} {...Href.includes(path!) ? { active: true } : {}}>
      <a href={Href}>{Label}</a>
    </ScaleTelekomNavItem>
  );
}
