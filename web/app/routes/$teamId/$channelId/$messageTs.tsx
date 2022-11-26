import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { extractTopicProps } from "~/common/topic.common";
import { Topic } from "~/components/topic";
import { getTopicWithReplies } from "~/server/topics.server";

export const loader = async ({ params }: LoaderArgs) => {
  const teamId = params.teamId;
  const channelId = params.channelId;
  const messageTs = params.messageTs;

  invariant(
    teamId,
    "Could not find teamId from loaderArgs.params. Make sure the there is parent route whose filename is $teamId"
  );
  invariant(
    channelId,
    "Could not find channelId from loaderArgs.params. Make sure the there is parent route whose filename is $channelId"
  );
  invariant(
    messageTs,
    "Could not find messageTs from loaderArgs.params. Make sure the there is current filename is $messageTs"
  );

  const topicWithReplies = await getTopicWithReplies({
    channelId,
    messageTs,
    teamId,
  });

  if (topicWithReplies instanceof Error) {
    console.log(topicWithReplies);
    throw new Response("NOT FOUND", { status: 404 });
  }

  return json({
    topic: topicWithReplies.topic,
    replies: topicWithReplies.replies,
  });
};

const TopicWithRepliesPage = () => {
  const loaderData = useLoaderData<typeof loader>();
  const topic = loaderData.topic;

  const { avaterLetter, capitalizedUserName, topicCreatedAt } =
    extractTopicProps(topic);

  return (
    <main className="flex flex-col gap-y-6">
      <Topic
        avatarLetter={avaterLetter}
        createdAt={topicCreatedAt}
        message={topic.message}
        username={capitalizedUserName}
      />
      <div className="border-b "></div>
      {loaderData.replies.map((replyTopic) => {
        const { avaterLetter, capitalizedUserName, topicCreatedAt } =
          extractTopicProps(replyTopic);

        return (
          <Topic
            key={replyTopic.messageTs}
            avatarLetter={avaterLetter}
            createdAt={topicCreatedAt}
            message={replyTopic.message}
            username={capitalizedUserName}
          />
        );
      })}
    </main>
  );
};

export default TopicWithRepliesPage;
