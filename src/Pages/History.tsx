import { ScaleButton, ScaleDataGrid, ScaleDropdownSelect, ScaleDropdownSelectItem, ScaleTextField } from "@telekom/scale-components-react";
import dayjs from "dayjs";
import { chain } from "lodash";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { EventStatus, EventType } from "~/Components/Event/Enums";
import { Dic } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function History() {
  const { DB } = useStatus();
  const gridRef = useRef<HTMLScaleDataGridElement>(null);

  const [filters, setFilters] = useState({
    startDate: dayjs().add(-6, 'month').format('YYYY-MM-DD'),
    endDate: "",
    serviceName: "",
    region: "",
    eventType: "",
    eventStatus: "",
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
      eventStatus: "",
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

      if (filters.eventStatus && event.Status !== filters.eventStatus) {
        return false;
      }

      return true;
    })
    .orderBy(x => x.Start, "desc")
    .value();

  useEffect(() => {
    if (!gridRef.current) {
      return;
    }

    const grid = gridRef.current;

    grid.fields = [
      { type: "number", label: "ID", sortable: true },
      { type: "tags", label: "Type", sortable: true },
      { type: "date", label: "Start CET", sortable: true },
      { type: "date", label: "End CET", sortable: true },
      { type: "text", label: "Status", sortable: true },
      { type: "text", label: "Region", sortable: true },
      { type: "text", label: "Service", sortable: true, stretchWeight: 0.8 },
      { type: "actions", label: "Detail" },
    ];

    const events = chain(filteredEvents)
      .map((x) => {
        const rs = Array.from(x.RegionServices);

        const Services = chain(rs)
          .map(s => s.Service.Name)
          .uniq()
          .value();

        const Regions = chain(rs)
          .map(r => r.Region.Name)
          .uniq()
          .value();

        let tag;
        switch (x.Type) {
          case EventType.Minor:
            tag = { content: EventType.Minor, color: "yellow" };
            break;
          case EventType.Major:
            tag = { content: EventType.Major, color: "orange" };
            break;
          case EventType.Outage:
            tag = { content: EventType.Outage, color: "red" };
            break;
          case EventType.Maintenance:
            tag = { content: EventType.Maintenance, color: "cyan" };
            break;
          default:
            tag = { content: EventType.Information, color: "standard" };
        }

        return [
          x.Id,
          [tag],
          dayjs(x.Start).tz(Dic.TZ).format(Dic.Time),
          x.End ? dayjs(x.End).tz(Dic.TZ).format(Dic.Time) : "-",
          x.Status,
          Regions.join(", "),
          Services.length > 2
            ? `${Services.slice(0, 2).join(", ")} +${Services.length - 2}`
            : Services.join(", "),
          [
            {
              label: "↗",
              variant: "secondary",
              href: `/Event/${x.Id}`
            }
          ]
        ];
      })
      .value();

    grid.rows = events;
  }, [gridRef.current, filteredEvents]);

  return <div className="h-full flex flex-col gap-4">
    <Helmet>
      <title>History - OTC Status Dashboard</title>
    </Helmet>

    <section className="flex-shrink-0">
      <h3 className="text-3xl font-medium text-slate-800">
        OTC Event History
      </h3>
    </section>

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
          inputAutocomplete="off"
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

        <ScaleDropdownSelect
          label="Event Status"
          value={filters.eventStatus}
          onScale-change={(e) => setFilters(prev => ({
            ...prev,
            eventStatus: e.target.value as string
          }))}
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

    <section className="flex-grow min-h-0">
      <ScaleDataGrid
        className="h-full rounded-lg bg-white shadow-md"
        pageSize={10}
        heading="Event History"
        hideBorder
        style={{
          minHeight: "400px",
          minWidth: "800px"
        }}
        ref={gridRef}
      />
    </section>
  </div>;
}
