import { ScaleLoadingSpinner } from "@telekom/scale-components-react";
import { Helmet } from "react-helmet";
import { useRouter } from "~/Components/Router";
import { Dic } from "~/Helpers/Entities";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function NotFound() {
  const { Rep } = useRouter();
  setTimeout(() => Rep("/"), 3000);

  return <>
    <Helmet>
      <title>Redirect - Not Found - {Dic.Name}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>

    <ScaleLoadingSpinner size="large" text="404, Redirecting..." />
  </>;
}
