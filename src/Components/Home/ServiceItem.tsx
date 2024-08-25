import dayjs from "dayjs";
import { chain, orderBy } from "lodash";
import { useEffect, useState } from "react";
import { useStatus } from "~/Services/Status";
import { Models } from "~/Services/Status.Models";
import { EventStatus, EventType } from "../Event/Enums";

interface IServiceItem {
  RegionService: Models.IRegionService;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function ServiceItem({ RegionService }: IServiceItem) {
  const { DB } = useStatus();

  const [status, setStatus] = useState(EventType.Operational);
  const [future, setFuture] = useState(false);
  const [id, setId] = useState<number>();

  useEffect(() => {
    const res = chain([...RegionService.Events])
      .map(x => ({
        Id: x.Id,
        Type: x.Type,
        Start: x.Start,
        Status: orderBy([...x.Histories], 'Created', 'desc')[0].Status
      }))
      .filter(x =>
        ![EventStatus.Completed, EventStatus.Resolved, EventStatus.Cancelled]
          .includes(x.Status)
      )
      .orderBy('Type', 'desc')
      .head()
      .value();

    if (res) {
      setStatus(res.Type);
      setFuture(res.Start.isAfter(dayjs()));
      setId(res.Id);
    }
  }, [DB, RegionService]);

  return (
    <div></div>
  )
}
