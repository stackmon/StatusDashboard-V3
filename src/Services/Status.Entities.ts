/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export interface StatusEntityV1 {
  attributes: AttributeEntity[];
  id: number;
  incidents: IncidentEntity[];
  name: string;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export type StatusEntityV2 = Omit<StatusEntityV1, "incidents">;

interface AttributeEntity {
  name: NameEnum;
  value: string;
}

export const enum NameEnum {
  Category = "category",
  Region = "region",
  Type = "type",
}

interface IncidentEntity {
  end_date: null | string;
  id: number;
  impact: number;
  start_date: string;
  text: string;
  updates: UpdateEntity[];
}

interface UpdateEntity {
  status: StatusEnum;
  text: string;
  timestamp: string;
}

export const enum StatusEnum {
  Analyzing = "analyzing",
  Changed = "changed",
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
}
