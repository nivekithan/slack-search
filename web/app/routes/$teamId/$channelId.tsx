import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { capitalizeFirstLetter } from "~/common/utils.common";
import { Topic } from "~/components/topic";
import { getTopics } from "~/server/topics.server";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import routeStyles from "~/styles/routes/$teamId/$channelId.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: routeStyles }];
};

const getTakeAndCursor = (url: URL) => {
  const searchParams = url.searchParams;
  const takeStr = searchParams.get("take") || "10";
  const takeInt = Number.isNaN(parseInt(takeStr, 10))
    ? 10
    : parseInt(takeStr, 10);

  const cursorStr =
    searchParams.get("cursor") || "on-conversion-int-it-will-become-nan";
  const cursorInt = Number.isNaN(parseInt(cursorStr, 10))
    ? undefined
    : parseInt(cursorStr, 10);

  return { take: takeInt, cursor: cursorInt };
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const teamId = params.teamId;
  const channelId = params.channelId;

  invariant(
    teamId,
    "Could not find teamId from loaderArgs.params. Make sure the there is parent route whose filename is $teamId"
  );
  invariant(
    channelId,
    "Could not find channelId from loaderArgs.params. Make sure the filename is $channelId"
  );

  const url = new URL(request.url);
  const { take, cursor } = getTakeAndCursor(url);

  const topics = await getTopics({ channelId, teamId, take, cursor });

  if (topics instanceof Error) {
    throw new Response("NOT FOUND", { status: 404 });
  }

  return json({ topics, teamId, channelId });
};

const TopicsPage = () => {
  const { topics, teamId, channelId } = useLoaderData<typeof loader>();
  const [allTopics, setAllTopics] = useState(topics);

  const parentRef = useRef<HTMLElement>(null);

  const parentOffsetRef = useRef(0);

  const currentOffsetWhichHaveLoaded = useRef(0);
  const fetcher = useFetcher<typeof loader>();

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  });

  const virtualizer = useWindowVirtualizer({
    count: allTopics.length,
    estimateSize: () => 300,
    scrollMargin: parentOffsetRef.current,
  });

  const indexAfterWhichToLoadMore = topics.length - 3;
  let newOffset = currentOffsetWhichHaveLoaded.current;
  if (virtualizer.range.endIndex >= indexAfterWhichToLoadMore) {
    const newOffsetToSet = topics.at(-1)?.cursorKey;

    if (typeof newOffsetToSet === "undefined") {
      throw new Error("It should not happen");
    }

    newOffset = newOffsetToSet;
  }

  useEffect(() => {
    if (newOffset === currentOffsetWhichHaveLoaded.current) return;

    const lastTopic = topics.at(-1);
    const lastTopicCursorKey = lastTopic?.cursorKey;

    invariant(
      typeof lastTopicCursorKey !== "undefined",
      "It should not happen"
    );

    const qs = new URLSearchParams([
      ["take", String(10)],
      ["cursor", String(lastTopicCursorKey)],
    ]);
    fetcher.load(`/${teamId}/${channelId}?${qs.toString()}`);
    currentOffsetWhichHaveLoaded.current = newOffset;
  }, [newOffset, fetcher, topics, teamId, channelId]);

  useEffect(() => {
    const fetcherData = fetcher.data;

    if (fetcherData) {
      setAllTopics((prevTopics) => [...prevTopics, ...fetcherData.topics]);
    }
  }, [fetcher.data]);

  return (
    <main>
      <ol
        style={{ height: virtualizer.getTotalSize() }}
        className="w-full relative"
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const topic = allTopics[virtualRow.index];
          const avaterLetter = topic.slackUser.userRealName

            .slice(0, 2)
            .toUpperCase();
          const topicCreatedAt = new Date(topic.createdAt);
          const capitalizedUserName = capitalizeFirstLetter(
            topic.slackUser.userRealName
          );
          const viewReplyLinkTo = `/${teamId}/${channelId}/${topic.messageTs}`;
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-o w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <div className="mb-6">
                <Topic
                  key={topic.id}
                  message={topic.message}
                  avatarLetter={avaterLetter}
                  createdAt={topicCreatedAt}
                  username={capitalizedUserName}
                  viewReplyLinkTo={viewReplyLinkTo}
                />
              </div>
            </div>
          );
        })}
      </ol>
    </main>
  );
};

export default TopicsPage;
