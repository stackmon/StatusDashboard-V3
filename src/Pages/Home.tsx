import { Helmet } from "react-helmet";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function Home() {
  const { DB } = useStatus();

  return (
    <>
      <Helmet>
        <title>OTC Status Dashboard</title>
      </Helmet>
    </>
  );
}
