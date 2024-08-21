import { useCreation } from "ahooks";
import { Helmet } from "react-helmet";
import { BehaviorSubject } from "rxjs";
import { Station } from "~/Helpers/Entities";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Home() {
  const { DB } = useStatus();

  const region = useCreation(
    () => Station.get("region", () => {
      const first = DB.Regions[0];
      return new BehaviorSubject(first);
    }), []);

  return (
    <>
      <Helmet>
        <title>OTC Status Dashboard</title>
      </Helmet>
    </>
  );
}
