import dayjs from "dayjs";
import { Models } from "~/Services/Status.Models";
import { Indicator } from "../Home/Indicator";
import { EventAffected } from "./EventAffected";
import { EventEditor } from "./EventEditor";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventCard({ Event }: { Event: Models.IEvent }) {
  return (
    <section className="flex flex-col gap-y-4 rounded-md bg-white px-8 py-6 shadow-md">
      <div className="flex justify-between">
        <div className="flex items-center gap-x-3">
          <Indicator Type={Event.Type} />

          <h3 className="text-2xl font-medium text-slate-800">
            {Event.Title}
          </h3>
        </div>

        <EventEditor Event={Event} />
      </div>

      <div className="flex gap-x-2.5">
        <div className="flex flex-col gap-y-2">
          <label className="text-xl font-medium text-slate-600">
            Impact Type:
          </label>

          <label className="text-xl font-medium text-slate-600">
            Current Status:
          </label>

          <label className="text-xl font-medium text-slate-600">
            Start At:
          </label>

          <label className="text-xl font-medium text-slate-600">
            (Plan) End At:
          </label>
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-xl font-medium text-slate-700">
            {Event.Type}
          </label>

          <label className="text-xl font-medium text-slate-700">
            {Event.Status}
          </label>

          <label className="text-xl font-medium text-slate-700">
            {dayjs(Event.Start).format("YYYY-MM-DD HH:mm [UTC]")}
          </label>

          <label className="text-xl font-medium text-slate-700">
            {Event.End ? dayjs(Event.End).format("YYYY-MM-DD HH:mm [UTC]") : "Still Ongoing"}
          </label>
        </div>
      </div>

      <div className="flex max-h-60 flex-col overflow-y-auto">
        <EventAffected Event={Event} />
      </div>
    </section>
  );
}
