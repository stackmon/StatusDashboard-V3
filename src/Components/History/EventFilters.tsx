import { ScaleButton, ScaleDropdownSelect, ScaleDropdownSelectItem, ScaleTextField } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { EventStatus, EventType } from "~/Components/Event/Enums";
import { Models } from "~/Services/Status.Models";

export interface IFilterState {
  startDate: string;
  endDate: string;
  serviceName: string;
  region: string;
  eventType: string;
  eventStatus: string;
}

export interface IFilterValidation {
  startDate: string;
  endDate: string;
}

interface IEventFilters {
  filters: IFilterState;
  validation: IFilterValidation;
  regions: Models.IRegion[];
  totalEvents: number;
  filteredCount: number;
  onFiltersChange: (filters: IFilterState) => void;
  onValidationChange: (validation: IFilterValidation) => void;
  onClearFilters: () => void;
}

/**
 * @author Aloento
 * @since 1.2.0
 * @version 1.0.0
 */
export function EventFilters({
  filters,
  validation,
  regions,
  totalEvents,
  filteredCount,
  onFiltersChange,
  onValidationChange,
  onClearFilters,
}: IEventFilters) {
  function validateDates(startDate: string, endDate: string) {
    const errors = { startDate: "", endDate: "" };

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (start.isAfter(end)) {
        errors.startDate = "Start date cannot be later than end date.";
      }
    }

    onValidationChange(errors);
    return !errors.startDate && !errors.endDate;
  }

  return (
    <section className="flex-shrink-0 rounded-lg bg-white shadow-md p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <ScaleTextField
          type="date"
          label="Start Date"
          placeholder="Select start date"
          value={filters.startDate}
          invalid={!!validation.startDate}
          helperText={validation.startDate}
          onScale-input={(e) => {
            const newStartDate = e.target.value as string;
            onFiltersChange({
              ...filters,
              startDate: newStartDate
            });
            validateDates(newStartDate, filters.endDate);
          }}
        />

        <ScaleTextField
          type="date"
          label="End Date"
          placeholder="Select end date"
          value={filters.endDate}
          invalid={!!validation.endDate}
          helperText={validation.endDate}
          onScale-input={(e) => {
            const newEndDate = e.target.value as string;
            onFiltersChange({
              ...filters,
              endDate: newEndDate
            });
            validateDates(filters.startDate, newEndDate);
          }}
        />

        <ScaleTextField
          label="Service Name"
          placeholder="Search service name"
          value={filters.serviceName}
          inputAutocomplete="off"
          onScale-input={(e) => onFiltersChange({
            ...filters,
            serviceName: e.target.value as string
          })}
        />

        <ScaleDropdownSelect
          label="Region"
          value={filters.region}
          onScale-change={(e) => onFiltersChange({
            ...filters,
            region: e.target.value as string
          })}
        >
          <ScaleDropdownSelectItem value="">All Regions</ScaleDropdownSelectItem>
          {regions.map((region, i) => (
            <ScaleDropdownSelectItem value={region.Name} key={i}>
              {region.Name}
            </ScaleDropdownSelectItem>
          ))}
        </ScaleDropdownSelect>

        <ScaleDropdownSelect
          label="Event Type"
          value={filters.eventType}
          onScale-change={(e) => onFiltersChange({
            ...filters,
            eventType: e.target.value as string
          })}
        >
          <ScaleDropdownSelectItem value="">All Types</ScaleDropdownSelectItem>
          {Object.values(EventType).slice(1).map((type, i) => (
            <ScaleDropdownSelectItem value={type} key={i}>
              {type}
            </ScaleDropdownSelectItem>
          ))}
        </ScaleDropdownSelect>

        <ScaleDropdownSelect
          label="Event Status"
          value={filters.eventStatus}
          onScale-change={(e) => onFiltersChange({
            ...filters,
            eventStatus: e.target.value as string
          })}
        >
          <ScaleDropdownSelectItem value="">All Status</ScaleDropdownSelectItem>
          {Object.values(EventStatus).map((status, i) => (
            <ScaleDropdownSelectItem value={status} key={i}>
              {status}
            </ScaleDropdownSelectItem>
          ))}
        </ScaleDropdownSelect>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Found {filteredCount} events, {totalEvents - filteredCount} filtered out
        </span>
        <ScaleButton
          variant="secondary"
          size="small"
          onClick={onClearFilters}
        >
          Clear Filters
        </ScaleButton>
      </div>
    </section>
  );
}
