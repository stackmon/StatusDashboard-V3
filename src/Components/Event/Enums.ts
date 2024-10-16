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
