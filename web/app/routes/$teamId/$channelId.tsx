import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { capitalizeFirstLetter } from "~/common/utils.common";
import { Topic } from "~/components/topic";
import { getTopics } from "~/server/topics.server";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import routeStyles from "~/styles/routes/$teamId/$channelId.css";
import { useLayoutEffect, useRef } from "react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: routeStyles }];
};

export const loader = async ({ params }: LoaderArgs) => {
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

  const topics = await getTopics({ channelId, teamId });

  if (topics instanceof Error) {
    throw new Response("NOT FOUND", { status: 404 });
  }

  return json({ topics, teamId, channelId });
};

const TopicsPage = () => {
  const { topics, teamId, channelId } = useLoaderData<typeof loader>();

  const parentRef = useRef<HTMLElement>(null);

  const parentOffsetRef = useRef(0);

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  });

  const virtualizer = useWindowVirtualizer({
    count: topics.length,
    estimateSize: () => 300,
    scrollMargin: parentOffsetRef.current,
  });

  return (
    <main>
      <ol
        style={{ height: virtualizer.getTotalSize() }}
        className="w-full relative"
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const topic = topics[virtualRow.index];
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
