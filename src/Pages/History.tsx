import { FluentProvider, Skeleton, SkeletonItem, webLightTheme } from "@fluentui/react-components";
import { Helmet } from "react-helmet";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function History() {
  return <>
    <Helmet>
      <title>Timeline - OTC Status Dashboard</title>
    </Helmet>

    <section className="flex flex-col gap-y-2">
      <h3 className="text-3xl font-medium text-slate-800">
        OTC Event Timeline
      </h3>
    </section>

    <FluentProvider
      theme={webLightTheme}
      className="-ml-3"
    >
      <Skeleton className="flex gap-x-5">
        <SkeletonItem size={24} shape="circle" />

        <div className="flex flex-col gap-y-3">
          <SkeletonItem size={32} style={{ width: "25vw" }} />

          <div className="flex gap-x-2.5">
            <SkeletonItem size={28} style={{ width: "5vw" }} />
            <SkeletonItem size={28} style={{ width: "10vw" }} />
          </div>

          <SkeletonItem size={28} style={{ width: "25vw" }} />
        </div>
      </Skeleton>
    </FluentProvider>
  </>;
}
