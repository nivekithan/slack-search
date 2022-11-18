import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { capitalizeFirstLetter } from "~/common/utils.common";
import { Topic } from "~/components/topic";
import { getTopics } from "~/server/topics.server";
import routeStyles from "~/styles/routes/$teamId/$channelId.css";

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
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main>
      <ol className="flex flex-col gap-y-6">
        {loaderData.topics.map((topic) => {
          const avaterLetter = topic.slackUser.userRealName
            .slice(0, 2)
            .toUpperCase();
          const topicCreatedAt = new Date(topic.createdAt);
          const capitalizedUserName = capitalizeFirstLetter(
            topic.slackUser.userRealName
          );
          const viewReplyLinkTo = `/${loaderData.teamId}/${loaderData.channelId}/${topic.messageTs}`;

          return (
            <Topic
              key={topic.id}
              message={topic.message}
              avatarLetter={avaterLetter}
              createdAt={topicCreatedAt}
              username={capitalizedUserName}
              viewReplyLinkTo={viewReplyLinkTo}
            />
          );
        })}
      </ol>
    </main>
  );
};

export default TopicsPage;
