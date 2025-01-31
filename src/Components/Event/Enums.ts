import { StatusEnum } from "~/Services/Status.Entities";

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

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function IsOpenStatus(status: EventStatus): boolean {
  return ![EventStatus.Completed, EventStatus.Resolved, EventStatus.Cancelled].includes(status);
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function GetStatusString(status: EventStatus): string {
  switch (status) {
    case EventStatus.Investigating:
      return StatusEnum.Analyzing;
    case EventStatus.Fixing:
      return StatusEnum.Fixing;
    case EventStatus.Monitoring:
      return StatusEnum.Observing;
    case EventStatus.Resolved:
      return StatusEnum.Resolved;
    case EventStatus.Scheduled:
      return StatusEnum.Modified;
    case EventStatus.Performing:
      return StatusEnum.InProgress;
    case EventStatus.Completed:
      return StatusEnum.Completed;
  }

  throw new Error("Invalid status: " + status);
}
