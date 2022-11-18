import { z } from "zod";
import { BACKEND_API_URL } from "./constant.server";
import { SlackUserSchema } from "./slackUser.server";
import { ZodStringToDate } from "./utils.server";

export type GetTopicsArgs = {
  teamId: string;
  channelId: string;
};

export const getTopicUrl = ({ teamId, channelId }: GetTopicsArgs) => {
  const endpoint = `${BACKEND_API_URL}/${teamId}/${channelId}/topics`;

  const url = new URL(endpoint);

  return url;
};

export const TopicSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  channelId: z.string(),
  userId: z.string(),
  messageTs: z.string(),
  repliesCount: z.number(),
  slackUser: SlackUserSchema,
  message: z.string(),
  createdAt: z.string().transform(ZodStringToDate),
  updatedAt: z.string().transform(ZodStringToDate),
});

export const AllTopicsSchema = z.array(TopicSchema);

export const getTopics = async ({ teamId, channelId }: GetTopicsArgs) => {
  const topicUrl = getTopicUrl({ teamId, channelId });
  topicUrl.searchParams.set("take", "10");

  const topicEndpointRes = await fetch(topicUrl);

  if (topicEndpointRes.ok) {
    const unsafeTopics = await topicEndpointRes.json();
    const validatedTopic = AllTopicsSchema.parse(unsafeTopics);

    return validatedTopic;
  }

  return new Error(`${topicEndpointRes.status} ${topicEndpointRes.statusText}`);
};
