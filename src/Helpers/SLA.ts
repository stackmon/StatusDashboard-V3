import dayjs from 'dayjs';
import { chain } from 'lodash';
import { IsIncident } from '~/Components/Event/Enums';
import { Models } from "~/Services/Status.Models";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Calc6Months(service: Models.IRegionService) {
  const now = dayjs();
  const sixMonth = now.subtract(6, 'month');

  const events = chain(Array.from(service.Events))
    .filter(e =>
      dayjs(e.Start).isAfter(sixMonth) && IsIncident(e.Type))
    .value();

  const results = [];

  for (let i = 0; i < 6; i++) {
    const startOfMonth = dayjs().startOf('month').subtract(i, 'month');
    const endOfMonth = startOfMonth.endOf('month');

    const monthlyEvents = events.filter(e =>
      dayjs(e.Start).isBefore(endOfMonth) &&
      dayjs(e.End ?? now).isAfter(startOfMonth)
    );

    const totalDowntime = monthlyEvents.reduce((sum, evt) => {
      const start = dayjs(evt.Start).isBefore(startOfMonth)
        ? startOfMonth : dayjs(evt.Start);

      const end = (evt.End && dayjs(evt.End).isBefore(endOfMonth))
        ? dayjs(evt.End) : endOfMonth;

      return sum + end.diff(start, 'minute');
    }, 0);

    const totalMinutes = endOfMonth.diff(startOfMonth, 'minute');
    const uptimePercentage = ((totalMinutes - totalDowntime) / totalMinutes) * 100;
    results.push(Math.max(uptimePercentage, 0));
  }

  results.reverse();
  return results;
}
