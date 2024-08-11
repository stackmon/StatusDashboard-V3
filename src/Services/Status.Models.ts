import { Dayjs } from "dayjs";
import { EventStatus, EventType } from "~/Components/Event/Enums";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export interface IStatusContext {
  Services: Models.IService[];
  Categories: Models.ICategory[];
  Regions: Models.IRegion[];
  Events: Models.IEvent[];
  Histories: Models.IHistory[];
  RegionsServices: Models.IRegionService[];
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export namespace Models {
  export interface IService {
    Id: number;
    Name: string;
    Abbr: string;
    Category: ICategory;
    Regions: IRegion[];
  }

  export interface ICategory {
    Id: number;
    Name: string;
    Services: IService[];
  }

  export interface IRegion {
    Id: number;
    Name: string;
    Services: IService[];
  }

  export interface IRegionService {
    Region: IRegion;
    Service: IService;
    Events: IEvent[];
  }

  export interface IEvent {
    Id: number;
    Title: string;
    Type: EventType;
    Start: Dayjs;
    End: Dayjs;
    RegionServices: IRegionService[];
    Histories: IHistory[];
  }

  export interface IHistory {
    Id: number;
    Message: string;
    Created: Dayjs;
    Status: EventStatus;
    Event: IEvent;
  }
}
