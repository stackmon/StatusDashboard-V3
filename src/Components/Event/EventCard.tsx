import dayjs from "dayjs";
import { Dic } from "~/Helpers/Entities";
import { Models } from "~/Services/Status.Models";
import { Authorized } from "../Auth/With";
import { Indicator } from "../Home/Indicator";
import { EventStatus, IsIncident } from "./Enums";
import { EventAffected } from "./EventAffected";
import { EventEditor } from "./EventEditor";

/**
 * Represents an EventCard component that displays detailed information about a specific event.
 * This component is designed to be highly flexible and adaptable to various event types and statuses.
 * It leverages multiple sub-components to render different parts of the event information.
 *
 * @param {Object} props - The properties object.
 * @param {Models.IEvent} props.Event - The event data to be displayed in the card.
 *
 * @remarks
 * This component is part of a larger system and interacts with several other components and services.
 * It is important to ensure that the event data passed to this component is accurate and up-to-date.
 * The component's appearance and behavior may change based on the event type and status.
 *
 * @author Aloento
 * @since 1.0.0
 * @version 0.2.0
 */
export function EventCard({ Event }: { Event: Models.IEvent }) {
  return (
    <section className="flex flex-col gap-y-4 rounded-md bg-white px-8 py-6 shadow-md">
      <div className="flex justify-between">
        <div className="flex items-center gap-x-3">
          <Indicator Type={Event.Type} />

          <h3 className="text-2xl font-medium text-slate-800 break-all">
            {Event.Title}
          </h3>
        </div>

        <Authorized>
          <EventEditor Event={Event} />
        </Authorized>
      </div>

      <div className="flex gap-x-2.5">
        <div className="flex flex-col gap-y-2">
          <label className="text-xl font-medium text-slate-600">
            Impact Type:
          </label>

          <label className="text-xl font-medium text-slate-600 whitespace-nowrap">
            Current Status:
          </label>

          <label className="text-xl font-medium text-slate-600">
            Start At:
          </label>

          <label className="text-xl font-medium text-slate-600 whitespace-nowrap">
            {!IsIncident(Event.Type) &&
              Event.Status !== EventStatus.Completed &&
              "(Plan)"} End At:
          </label>

          {!IsIncident(Event.Type) && Event.Description &&
            <label className="text-xl font-medium text-slate-600">
              Description:
            </label>}
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-xl font-medium text-slate-700">
            {Event.Type}
          </label>

          <label className="text-xl font-medium text-slate-700">
            {Event.Status}
          </label>

          <label className="text-xl font-medium text-slate-700">
            {dayjs(Event.Start).tz(Dic.TZ).format(Dic.TimeTZ)}
          </label>

          <label className="text-xl font-medium text-slate-700">
            {Event.End ? dayjs(Event.End).tz(Dic.TZ).format(Dic.TimeTZ) : "Still Ongoing"}
          </label>

          {!IsIncident(Event.Type) && Event.Description &&
            <label className="text-xl font-medium text-slate-700 break-all">
              {Event.Description}
            </label>}
        </div>
      </div>

      <div className="flex max-h-60 flex-col overflow-y-auto">
        <EventAffected Event={Event} />
      </div>
    </section>
  );
}
