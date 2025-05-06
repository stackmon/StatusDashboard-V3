import { StatusEnum } from "~/Services/Status.Entities";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export enum EventType {
  Operational = "Operational",
  Maintenance = "Maintenance",
  Minor = "Minor Incident",
  Major = "Major Incident",
  Outage = "Service Outage",
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
      return EventType.Minor;
    case 2:
      return EventType.Major;
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
    case EventType.Minor:
      return 1;
    case EventType.Major:
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
  Analysing = "Analysing",
  Fixing = "Fixing",
  Observing = "Observing",
  Resolved = "Resolved",

  Modified = "Modified",
  InProgress = "InProgress",
  Completed = "Completed",

  Reopened = "Reopened",
  Changed = "Changed",
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function IsOpenStatus(status: EventStatus): boolean {
  return ![EventStatus.Completed, EventStatus.Resolved].includes(status);
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function GetStatusString(status: EventStatus): string {
  switch (status) {
    case EventStatus.Analysing:
      return StatusEnum.Analysing;
    case EventStatus.Fixing:
      return StatusEnum.Fixing;
    case EventStatus.Observing:
      return StatusEnum.Observing;
    case EventStatus.Resolved:
      return StatusEnum.Resolved;
    case EventStatus.Modified:
      return StatusEnum.Modified;
    case EventStatus.InProgress:
      return StatusEnum.InProgress;
    case EventStatus.Completed:
      return StatusEnum.Completed;
    case EventStatus.Reopened:
      return StatusEnum.Reopened;
    case EventStatus.Changed:
      return StatusEnum.Changed;
  }
}
