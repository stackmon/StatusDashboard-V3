import { Helmet } from "react-helmet";
import { AvailaMatrix } from "~/Components/Availability/AvailaMatrix";
import { RegionSelector } from "~/Components/Home/RegionSelector";
import { AvailaContext } from "~/Services/Availability";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Availability() {
  return <>
    <Helmet>
      <title>Availability - OTC Status Dashboard</title>
    </Helmet>

    <RegionSelector
      Title="OTC Availability Matrix"
      Topic="Availability"
    />

    <AvailaContext>
      <AvailaMatrix />
    </AvailaContext>
  </>;
}
