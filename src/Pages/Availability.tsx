import { Helmet } from "react-helmet";
import { AvailaMatrix } from "~/Components/Availability/AvailaMatrix";
import { RegionSelector } from "~/Components/Home/RegionSelector";
import { Dic } from "~/Helpers/Entities";
import { AvailaContext } from "~/Services/Availability";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Availability() {
  return <>
    <Helmet>
      <title>Availability - {Dic.Name} {Dic.Prod}</title>
    </Helmet>

    <RegionSelector
      Title="Availability Matrix"
      Topic="Availability"
    />

    <AvailaContext>
      <AvailaMatrix />
    </AvailaContext>
  </>;
}
