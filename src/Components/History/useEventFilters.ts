import dayjs from "dayjs";
import { chain } from "lodash";
import { useState } from "react";
import { Models } from "~/Services/Status.Models";
import { IFilterState, IFilterValidation } from "./EventFilters";

const DEFAULT_FILTERS: IFilterState = {
  startDate: dayjs().add(-6, 'month').format('YYYY-MM-DD'),
  endDate: "",
  serviceName: "",
  region: "",
  eventType: "",
  eventStatus: "",
};

const DEFAULT_VALIDATION: IFilterValidation = {
  startDate: "",
  endDate: "",
};

/**
 * @author Aloento
 * @since 1.2.0
 * @version 1.0.0
 */
export function useEventFilters(events: Models.IEvent[]) {
  const [filters, setFilters] = useState<IFilterState>(DEFAULT_FILTERS);
  const [validation, setValidation] = useState<IFilterValidation>(DEFAULT_VALIDATION);

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setValidation(DEFAULT_VALIDATION);
  }

  const filteredEvents = chain(events)
    .filter(event => {
      if (filters.startDate) {
        const filterStart = dayjs(filters.startDate).startOf('day');
        const eventStart = dayjs(event.Start);
        if (eventStart.isBefore(filterStart)) return false;
      }

      if (filters.endDate) {
        const filterEnd = dayjs(filters.endDate).endOf('day');
        const eventStart = dayjs(event.Start);
        const eventEnd = event.End ? dayjs(event.End) : eventStart;
        if (eventEnd.isAfter(filterEnd)) return false;
      }

      if (filters.serviceName) {
        const serviceNames = Array.from(event.RegionServices)
          .map(rs => ({
            name: rs.Service.Name.toLowerCase(),
            abbr: rs.Service.Abbr.toLowerCase()
          }));
        const searchTerm = filters.serviceName.toLowerCase();
        const hasService = serviceNames.some(service =>
          service.name.includes(searchTerm) || service.abbr.includes(searchTerm)
        );
        if (!hasService) return false;
      }

      if (filters.region) {
        const regionNames = Array.from(event.RegionServices)
          .map(rs => rs.Region.Name);
        const hasRegion = regionNames.includes(filters.region);
        if (!hasRegion) return false;
      }

      if (filters.eventType && event.Type !== filters.eventType) {
        return false;
      }

      if (filters.eventStatus && event.Status !== filters.eventStatus) {
        return false;
      }

      return true;
    })
    .orderBy(x => x.Start, "desc")
    .value();

  return {
    filters,
    validation,
    filteredEvents,
    setFilters,
    setValidation,
    clearFilters,
  };
}
