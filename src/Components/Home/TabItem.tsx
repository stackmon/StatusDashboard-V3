import { ScaleTabHeader, ScaleTabPanel } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { Models } from "~/Services/Status.Models";

interface INavWorkaround {
  Item: Models.IRegion;
  Topic: string;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function TabItem({ Item, Topic }: INavWorkaround) {
  const regionSub = useCreation(
    () => Station.get<BehaviorSubject<Models.IRegion>>(Topic), []);

  return <>
    <ScaleTabHeader
      slot="tab"
      onScale-select={() => regionSub.next(Item)}
    >
      {Item.Name}
    </ScaleTabHeader>
    <ScaleTabPanel className="hidden" slot="panel" />
  </>;
}
