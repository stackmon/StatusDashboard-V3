import { ScaleTabHeader, ScaleTabPanel } from "@telekom/scale-components-react";
import { useCreation, useMount } from "ahooks";
import { useRef } from "react";
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
export function NavWorkaround({ Item, Topic }: INavWorkaround) {
  const regionSub = useCreation(
    () => Station.get<BehaviorSubject<Models.IRegion>>(Topic), []);

  const head = useRef<HTMLScaleTabHeaderElement>(null);
  const panel = useRef<HTMLScaleTabPanelElement>(null);

  useMount(() => {
    const i = setInterval(() => {
      if (!panel.current?.id) {
        return;
      }

      head.current?.setAttribute('aria-controls', panel.current.id);
      clearInterval(i);
    }, 100);
  });

  return <>
    <ScaleTabHeader
      ref={head}
      slot="tab"
      onScale-select={() => regionSub.next(Item)}
    >
      {Item.Name}
    </ScaleTabHeader>
    <ScaleTabPanel ref={panel} className="hidden" slot="panel" />
  </>;
}
