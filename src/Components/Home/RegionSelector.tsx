import { useCreation } from "ahooks";
import { Station } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

interface IRegionSelector {
  Title: string;
  Subject: string;
}

export function RegionSelector({ Title, Subject }: IRegionSelector) {
  const { DB: { Regions } } = useStatus();
  const regionSub = useCreation(() => Station.get(Subject), []);

  return (
    <div>
      <h1>Region Selector</h1>
    </div>
  );
}
