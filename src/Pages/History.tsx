import { FluentProvider, Skeleton, SkeletonItem, webLightTheme } from "@fluentui/react-components";
import { useBoolean, useInViewport } from "ahooks";
import { chain } from "lodash";
import { useRef } from "react";
import { Helmet } from "react-helmet";
import { EventItem } from "~/Components/History/EventItem";
import { useStatus } from "~/Services/Status";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function History() {
  const { DB } = useStatus();

  const skel = useRef<HTMLDivElement>(null);
  const [isBottom] = useInViewport(skel);
  const [isEnd, { set }] = useBoolean(true);

  const loading = isBottom && !isEnd;

  return <>
    <Helmet>
      <title>Timeline - OTC Status Dashboard</title>
    </Helmet>

    <section className="flex flex-col gap-y-2">
      <h3 className="text-3xl font-medium text-slate-800">
        OTC Event Timeline
      </h3>
    </section>

    <ol className="flex flex-col">
      {chain(DB.Events)
        .sortBy(x => x.Start, "desc")
        .map((event, index, events) => [events[index - 1], event])
        .map(([prev, curr]) => (
          <EventItem key={curr.Id} Prev={prev} Curr={curr} />
        ))
        .value()}
    </ol>

    <FluentProvider
      theme={webLightTheme}
      className="-ml-3"
      ref={skel}
    >
      <Skeleton className="gap-x-5" style={{ display: loading ? "flex" : "none" }}>
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
