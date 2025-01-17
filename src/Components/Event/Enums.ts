/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export enum EventType {
  Operational = "Operational",
  Maintenance = "Maintenance",
  MinorIssue = "Minor Issue",
  MajorIssue = "Major Issue",
  Outage = "Outage",
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function GetEventType(impact: number): EventType {
  switch (impact) {
    case 0:
      return EventType.Maintenance;
    case 1:
      return EventType.MinorIssue;
    case 2:
      return EventType.MajorIssue;
    default:
      return EventType.Outage;
  }
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function GetEventImpact(type: EventType): number {
  switch (type) {
    case EventType.Maintenance:
      return 0;
    case EventType.MinorIssue:
      return 1;
    case EventType.MajorIssue:
      return 2;
    default:
      return 3;
  }
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export enum EventStatus {
  Investigating = "Investigating",
  Fixing = "Fixing",
  Monitoring = "Monitoring",
  Resolved = "Resolved",

  Scheduled = "Scheduled",
  Performing = "Performing",
  Completed = "Completed",
  Cancelled = "Cancelled",
}
