import { ScaleDivider, ScaleTabHeader, ScaleTabNav, ScaleTabPanel } from "@telekom/scale-components-react";
import { useCreation } from "ahooks";
import { Station } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";
import "./RegionSelector.css";

interface IRegionSelector {
  Title: string;
  Topic: string;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function RegionSelector({ Title, Topic }: IRegionSelector) {
  const { DB: { Regions } } = useStatus();
  const regionSub = useCreation(() => Station.get(Topic), []);

  return (
    <section className="flex flex-col" id="RegionSelector">
      <div className="flex items-center justify-between">
        <label className="text-3xl font-medium text-slate-800">
          {Title}
        </label>

        <ScaleTabNav>
          {Regions.map((item, i) => <>
            <ScaleTabHeader
              key={item.Name}
              slot="tab"
              onClick={() => regionSub.next(item)}
            >
              {item.Name}
            </ScaleTabHeader>
            <ScaleTabPanel key={i} className="hidden" slot="panel" />
          </>)}
        </ScaleTabNav>
      </div>

      <ScaleDivider />
    </section>
  );
}
