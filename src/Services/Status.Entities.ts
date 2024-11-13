/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export interface StatusEntityV1 {
  attributes: AttributeEntity[];
  id: number;
  incidents: IncidentEntityV1[];
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

interface IncidentEntityV1 {
  end_date: null | string;
  id: number;
  impact: number;
  start_date: string;
  text: string;
  updates: UpdateEntityV1[];
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export interface IncidentEntityV2 extends Omit<IncidentEntityV1, "updates" | "text"> {
  title: string;
  components: number[];
  system: boolean;
  updates?: UpdateEntityV2[];
}

interface UpdateEntityV1 {
  status: StatusEnum;
  text: string;
  timestamp: string;
}

interface UpdateEntityV2 extends UpdateEntityV1 {
  id: number;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export const enum StatusEnum {
  Analyzing = "analyzing",
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
}
