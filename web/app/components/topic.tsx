import { Link } from "@remix-run/react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { formatRelative } from "date-fns";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import type { z } from "zod";
import type { TopicSchema } from "~/common/topic.common";
import { extractTopicProps } from "~/common/topic.common";
import { capitalizeFirstLetter } from "~/common/utils.common";

export type TopicProps = {
  message: string;
  avatarLetter: string;
  username: string;
  createdAt: Date;
  viewReplyLinkTo?: string;
};

export const Topic = ({
  message,
  avatarLetter,
  username,
  createdAt,
  viewReplyLinkTo,
}: TopicProps) => {
  const relativeTime = capitalizeFirstLetter(
    formatRelative(createdAt, new Date())
  );

  return (
    <div className="topic_container text-base px-3">
      <div className="__avatar grid place-items-center w-9 h-9 bg-blue-600 text-white rounded-full">
        <span>{avatarLetter}</span>
      </div>
      <h1 className="__username font-semibold">{username}</h1>
      <p className="__time font-light text-sm text-gray-600">{relativeTime}</p>
      <p className="__message">{message}</p>
      {viewReplyLinkTo ? (
        <Link
          to={viewReplyLinkTo}
          className="__view_replies text-sm text-blue-600 pt-3 hover:underline"
        >
          View Replies
        </Link>
      ) : null}
    </div>
  );
};

export type InfiniteScrollTopicsProps = {
  topics: z.infer<typeof TopicSchema>[];
  onLoadMore: () => void;
  scrollMargin: number;
  teamId: string;
  channelId: string;
};

export const InfiniteWindowScrollTopics = ({
  topics,
  onLoadMore,
  scrollMargin,
  teamId,
  channelId,
}: InfiniteScrollTopicsProps) => {
  const currentOffsetWhichHaveLoaded = useRef(0);

  const virtualizer = useWindowVirtualizer({
    count: topics.length,
    estimateSize: () => 300,
    scrollMargin: scrollMargin,
  });

  const indexAfterWhichToLoadMore = topics.length - 3;
  let newOffset = currentOffsetWhichHaveLoaded.current;

  if (virtualizer.range.endIndex >= indexAfterWhichToLoadMore) {
    const newOffsetToSet = topics.length - 1;

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
    onLoadMore();
    currentOffsetWhichHaveLoaded.current = newOffset;
  }, [newOffset, onLoadMore, topics]);

  return (
    <ol
      className="w-full relative"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const topic = topics[virtualRow.index];
        const { avaterLetter, capitalizedUserName, topicCreatedAt } =
          extractTopicProps(topic);
        const viewReplyLinkTo = `/${teamId}/${channelId}/${topic.messageTs}`;
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            <div className="mb-6">
              <Topic
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
  );
};
