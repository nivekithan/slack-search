import { z } from "zod";
import { BACKEND_API_URL } from "./constant.server";
import { SlackUserSchema } from "./slackUser.server";
import { ZodStringToDate } from "./utils.server";

export type GetTopicsArgs = {
  teamId: string;
  channelId: string;
  take: number;
  cursor?: number;
};

export const getTopicUrl = ({
  teamId,
  channelId,
  take,
  cursor,
}: GetTopicsArgs) => {
  const endpoint = `${BACKEND_API_URL}/${teamId}/${channelId}/topics`;

  const url = new URL(endpoint);

  url.searchParams.set("take", String(take));

  if (cursor) {
    url.searchParams.set("cursor", String(cursor));
  }

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
  cursorKey : z.number(),
});

export const AllTopicsSchema = z.array(TopicSchema);

export const getTopics = async ({
  teamId,
  channelId,
  take,
  cursor,
}: GetTopicsArgs) => {
  const topicUrl = getTopicUrl({ teamId, channelId, take, cursor });

  const topicEndpointRes = await fetch(topicUrl);

  if (topicEndpointRes.ok) {
    const unsafeTopics = await topicEndpointRes.json();
    const validatedTopic = AllTopicsSchema.parse(unsafeTopics);

    return validatedTopic;
  }

  return new Error(`${topicEndpointRes.status} ${topicEndpointRes.statusText}`);
};
