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
  RegionService: Models.IRegionService[];
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
    Regions: Set<IRegion>;
  }

  export interface ICategory {
    Id: number;
    Name: string;
    Services: Set<IService>;
  }

  export interface IRegion {
    Id: number;
    Name: string;
    Services: Set<IService>;
  }

  export interface IRegionService {
    Id: number;
    Region: IRegion;
    Service: IService;
    Events: Set<IEvent>;
  }

  export interface IEvent {
    Id: number;
    Title: string;
    Type: EventType;
    Start: Date;
    End?: Date;
    Status: EventStatus;
    RegionServices: Set<IRegionService>;
    Histories: Set<IHistory>;
  }

  export interface IHistory {
    Id: number;
    Message: string;
    Created: Date;
    Status: EventStatus;
    Event: IEvent;
  }
}
