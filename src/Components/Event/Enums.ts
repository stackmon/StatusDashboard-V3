import { StatusEnum } from "~/Services/Status.Entities";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export enum EventType {
  Operational = "Operational",
  Maintenance = "Maintenance",
  Minor = "Minor Incident",
  Major = "Major Incident",
  Outage = "Service Outage",
  Information = "Information",
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function GetEventType(impact: number): EventType {
  switch (impact) {
    case 0:
      return EventType.Maintenance;
    case 1:
      return EventType.Minor;
    case 2:
      return EventType.Major;
    case 3:
      return EventType.Outage;
    default:
      return EventType.Information;
  }
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function GetEventImpact(type: EventType): number {
  switch (type) {
    case EventType.Minor:
      return 1;
    case EventType.Major:
      return 2;
    case EventType.Outage:
      return 3;
    default:
      return 0;
  }
}

/**
 * @author Aloento
 * @since 1.1.0
 * @version 0.1.0
 */
export function IsIncident(type: EventType): boolean {
  return [EventType.Minor, EventType.Major, EventType.Outage].includes(type);
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.1
 */
export enum EventStatus {
  Detected = "Detected",
  Analysing = "Analysing",
  Fixing = "Fixing",
  Observing = "Observing",
  Resolved = "Resolved",

  Planned = "Planned",
  Modified = "Modified",
  InProgress = "In Progress",
  Completed = "Completed",
  Cancelled = "Cancelled",

  Active = "Active",
  Reopened = "Reopened",
  Changed = "Changed",
}

/**
 * @author Aloento
 * @since 1.1.0
 * @version 0.1.0
 */
export function GetStatusList(type: EventType): EventStatus[] {
  switch (type) {
    case EventType.Maintenance:
      return Object.values(EventStatus).slice(4, 9);
    case EventType.Information:
      return [EventStatus.Planned, EventStatus.Active, EventStatus.Completed, EventStatus.Cancelled];
    default:
      return Object.values(EventStatus).slice(0, 4);
  }
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
 * @version 0.2.0
 */
export function GetStatusString(status: EventStatus): string {
  switch (status) {
    case EventStatus.Detected:
      return StatusEnum.Detected;
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
    case EventStatus.Planned:
      return StatusEnum.Planned;
    case EventStatus.Cancelled:
      return StatusEnum.Cancelled;
    case EventStatus.Active:
      return StatusEnum.Active;
  }
}
