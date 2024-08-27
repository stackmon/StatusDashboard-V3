import { ScaleDivider, ScaleTabNav } from "@telekom/scale-components-react";
import { useStatus } from "~/Services/Status";
import { NavWorkaround } from "./NavWorkaround";
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

  return (
    <section className="flex flex-col" id="RegionSelector">
      <div className="flex items-center justify-between">
        <label className="text-3xl font-medium text-slate-800">
          {Title}
        </label>

        <ScaleTabNav>
          {Regions.map((item, i) =>
            <NavWorkaround key={i} Item={item} Topic={Topic} />)}
        </ScaleTabNav>
      </div>

      <ScaleDivider />
    </section>
  );
}
