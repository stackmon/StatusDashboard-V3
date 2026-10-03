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
 * @version 0.3.2
 */
export interface EventEntityV2 {
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
  creator?: string;
  contact_email?: string;
  version?: number;
  status?: StatusEnum;
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
 * @version 0.3.1
 */
export const enum StatusEnum {
  Analysing = "analysing",
  Detected = "detected",
  Changed = "changed",
  ImpactChanged = "impact changed",
  Completed = "completed",
  Fixing = "fixing",
  InProgress = "in_progress",
  Modified = "modified",
  Observing = "observing",
  Reopened = "reopened",
  Resolved = "resolved",
  System = "SYSTEM",
  Planned = "planned",
  Cancelled = "cancelled",
  Active = "active",
  PendingReview = "pending_review",
  Reviewed = "reviewed",

  /**
   * Legacy spellings that only exist in rows stored by older backends; the
   * backend passes them through verbatim and folds nothing, so the canonical
   * members above are matched to them in `ResolveEventStatus`. Never send these
   * back: the API validates `status` against a closed set.
   */
  Analyzing = "analyzing",
  Description = "description",
  InProgressLegacy = "in progress",
  Scheduled = "scheduled",
}
