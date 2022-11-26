import { z } from "zod";
import { SlackUserSchema } from "./slackUser.common";
import { capitalizeFirstLetter } from "./utils.common";

export const TopicSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  channelId: z.string(),
  userId: z.string(),
  messageTs: z.string(),
  repliesCount: z.number(),
  slackUser: SlackUserSchema,
  message: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  cursorKey: z.number(),
});

export const AllTopicsSchema = z.array(TopicSchema);

export const extractTopicProps = (topic: z.infer<typeof TopicSchema>) => {
  const avaterLetter = topic.slackUser.userRealName.slice(0, 2).toUpperCase();
  const topicCreatedAt = new Date(topic.createdAt);
  const capitalizedUserName = capitalizeFirstLetter(
    topic.slackUser.userRealName
  );

  return { avaterLetter, topicCreatedAt, capitalizedUserName };
};
