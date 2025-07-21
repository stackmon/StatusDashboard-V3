/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export interface StatusEntityV2 {
  attributes: AttributeEntity[];
  id: number;
  name: string;
}

interface AttributeEntity {
  name: NameEnum;
  value: string;
}

export const enum NameEnum {
  Category = "category",
  Region = "region",
  Type = "type",
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export interface IncidentEntityV2 {
  title: string;
  components: number[];
  system: boolean;
  end_date: null | string;
  id: number;
  impact: number;
  start_date: string;
  updates?: UpdateEntityV2[];
  type: string;
  description?: string;
}

interface UpdateEntityV2 {
  id: number;
  status: StatusEnum;
  text: string;
  timestamp: string;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.1
 */
export const enum StatusEnum {
  Analyzing = "analyzing",
  Analysing = "analysing",
  Detected = "detected",
  Changed = "changed",
  ImpactChanged = "impact changed",
  Completed = "completed",
  Description = "description",
  Fixing = "fixing",
  InProgress = "in progress",
  Modified = "modified",
  Observing = "observing",
  Reopened = "reopened",
  Resolved = "resolved",
  Scheduled = "scheduled",
  System = "SYSTEM",
  Planned = "planned",
  Cancelled = "cancelled",
  Active = "active",
}
