import { createElement, useMemo } from "react";
import { EventType } from "../Event/Enums";

interface IIndicator {
  Type: EventType;
  Size?: number;
  Class?: string;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function Indicator({ Type, Size, Class }: IIndicator) {
  const scaleIcon = "scale-icon-";
  const scaleColor = "var(--telekom-color-";
  const func = "functional-";
  const text = `${scaleColor}text-and-icon-${func}`;

  const iconName = useMemo(() => {
    switch (Type) {
      case EventType.Maintenance:
        return "service-maintanance";
      case EventType.Minor:
        return "action-minus-circle";
      case EventType.Major:
        return "alert-warning";
      case EventType.Outage:
        return "action-circle-close";
      case EventType.Information:
        return "alert-information";
      default:
        return "action-success";
    }
  }, [Type]);

  const fillColor = useMemo(() => {
    switch (Type) {
      case EventType.Maintenance:
        return `${text}informational)`;
      case EventType.Minor:
        return `${scaleColor}${func}warning-standard)`;
      case EventType.Major:
        return `${text}warning)`;
      case EventType.Outage:
        return `${text}danger)`;
      case EventType.Information:
        return `${text}disabled)`;
      default:
        return `${text}success)`;
    }
  }, [Type]);

  return createElement(
    `${scaleIcon}${iconName}`,
    {
      "accessibility-title": Type,
      fill: fillColor,
      class: Class,
      ...(Size ? { size: Size } : {}),
    }
  );
}
