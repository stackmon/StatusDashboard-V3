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
 * @version 0.1.0
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
      case EventType.MinorIssue:
        return "action-minus-circle";
      case EventType.MajorIssue:
        return "alert-warning";
      case EventType.Outage:
        return "action-circle-close";
      default:
        return "action-success";
    }
  }, [Type]);

  const fillColor = useMemo(() => {
    switch (Type) {
      case EventType.Maintenance:
        return `${text}informational)`;
      case EventType.MinorIssue:
        return `${scaleColor}${func}warning-standard)`;
      case EventType.MajorIssue:
        return `${text}warning)`;
      case EventType.Outage:
        return `${text}danger)`;
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
