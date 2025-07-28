import dayjs from "dayjs";
import { Dic } from "~/Helpers/Entities";
import { Models } from "~/Services/Status.Models";
import { Authorized } from "../Auth/With";
import { Indicator } from "../Home/Indicator";
import { EventStatus, IsIncident } from "./Enums";
import { EventAffected } from "./EventAffected";
import { EventEditor } from "./EventEditor";
import { EventExtract } from "./EventExtract";

/**
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
          <div className="flex gap-x-3">
            {
              Event.RegionServices.size > 1 &&
              <EventExtract Event={Event} />
            }
            <EventEditor Event={Event} />
          </div>
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

          {Event.Description &&
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

          {Event.Description &&
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
