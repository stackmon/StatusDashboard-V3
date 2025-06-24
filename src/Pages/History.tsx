import { ScaleButton, ScaleDropdownSelect, ScaleDropdownSelectItem, ScaleTextField } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { EventType } from "~/Components/Event/Enums";
import { EventItem } from "~/Components/History/EventItem";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function History() {
  const { DB } = useStatus();

  const [filters, setFilters] = useState({
    startDate: dayjs().add(-6, 'month').format('YYYY-MM-DD'),
    endDate: "",
    serviceName: "",
    region: "",
    eventType: "",
  });

  const [validation, setValidation] = useState({
    startDate: "",
    endDate: "",
  });

  function validateDates(startDate: string, endDate: string) {
    const errors = { startDate: "", endDate: "" };

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (start.isAfter(end)) {
        errors.startDate = "Start date cannot be later than end date.";
      }
    }

    if (endDate) {
      const end = dayjs(endDate);
      const now = dayjs();

      if (end.isAfter(now)) {
        errors.endDate = "End date cannot be in the future.";
      }
    }

    setValidation(errors);
    return !errors.startDate && !errors.endDate;
  }

  function clearFilters() {
    setFilters({
      startDate: dayjs().add(-6, 'month').format('YYYY-MM-DD'),
      endDate: "",
      serviceName: "",
      region: "",
      eventType: "",
    });
    setValidation({
      startDate: "",
      endDate: "",
    });
  }

  const filteredEvents = chain(DB.Events)
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

      return true;
    })
    .orderBy(x => x.Start, "desc")
    .value();

  return <>
    <Helmet>
      <title>Timeline - OTC Status Dashboard</title>
    </Helmet>

    <section className="flex flex-col gap-y-2">
      <h3 className="text-3xl font-medium text-slate-800">
        OTC Event Timeline
      </h3>
    </section>

    <section className="flex flex-col rounded-lg bg-white shadow-md p-5 gap-y-1.5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <ScaleTextField
          type="date"
          label="Start Date"
          placeholder="Select start date"
          value={filters.startDate}
          invalid={!!validation.startDate}
          helperText={validation.startDate}
          onScale-input={(e) => {
            const newStartDate = e.target.value as string;
            setFilters(prev => ({
              ...prev,
              startDate: newStartDate
            }));
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
            setFilters(prev => ({
              ...prev,
              endDate: newEndDate
            }));
            validateDates(filters.startDate, newEndDate);
          }}
        />

        <ScaleTextField
          label="Service Name"
          placeholder="Search service name"
          value={filters.serviceName}
          onScale-input={(e) => setFilters(prev => ({
            ...prev,
            serviceName: e.target.value as string
          }))}
        />

        <ScaleDropdownSelect
          label="Region"
          value={filters.region}
          onScale-change={(e) => setFilters(prev => ({
            ...prev,
            region: e.target.value as string
          }))}
        >
          <ScaleDropdownSelectItem value="">All Regions</ScaleDropdownSelectItem>
          {DB.Regions.map((region, i) => (
            <ScaleDropdownSelectItem value={region.Name} key={i}>
              {region.Name}
            </ScaleDropdownSelectItem>
          ))}
        </ScaleDropdownSelect>

        <ScaleDropdownSelect
          label="Event Type"
          value={filters.eventType}
          onScale-change={(e) => setFilters(prev => ({
            ...prev,
            eventType: e.target.value as string
          }))}
        >
          <ScaleDropdownSelectItem value="">All Types</ScaleDropdownSelectItem>
          {Object.values(EventType).slice(1).map((type, i) => (
            <ScaleDropdownSelectItem value={type} key={i}>
              {type}
            </ScaleDropdownSelectItem>
          ))}
        </ScaleDropdownSelect>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Found {filteredEvents.length} events, {DB.Events.length - filteredEvents.length} filtered out
        </span>
        <ScaleButton
          variant="secondary"
          size="small"
          onClick={clearFilters}
        >
          Clear Filters
        </ScaleButton>
      </div>
    </section>

    <ol className="flex flex-col pl-3 xl:pl-0">
      {chain(filteredEvents)
        .map((event, index, events) => [events[index - 1], event])
        .map(([prev, curr]) => (
          <EventItem key={curr.Id} Prev={prev} Curr={curr} />
        ))
        .value()}
    </ol>
  </>;
}
