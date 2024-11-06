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
 * @version 0.1.0
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
 * @version 0.1.0
 */
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
