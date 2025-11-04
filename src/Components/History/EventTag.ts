import { EventType } from "~/Components/Event/Enums";

/**
 * @author Aloento
 * @since 1.2.0
 * @version 0.1.0
 */
export function getEventTag(type: EventType): any {
  let tag;

  switch (type) {
    case EventType.Minor:
      tag = { content: EventType.Minor, color: "yellow" };
      break;
    case EventType.Major:
      tag = { content: EventType.Major, color: "orange" };
      break;
    case EventType.Outage:
      tag = { content: EventType.Outage, color: "red" };
      break;
    case EventType.Maintenance:
      tag = { content: EventType.Maintenance, color: "cyan" };
      break;
    default:
      tag = { content: EventType.Information, color: "standard" };
  }

  const tagArray: any = [tag];
  tagArray.toLowerCase = () => tag.content.toLowerCase();

  return tagArray;
}
