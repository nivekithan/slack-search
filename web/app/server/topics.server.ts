import { AllTopicsSchema, TopicSchema } from "~/common/topic.common";
import { BACKEND_API_URL } from "./constant.server";

export type GetTopicsArgs = {
  teamId: string;
  channelId: string;
  take: number;
  cursor?: number;
};

export const getAllTopicsUrl = ({
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

export type GetTopicUrlArgs = {
  teamId: string;
  channelId: string;
  messageTs: string;
};

export const getTopicUrl = ({
  channelId,
  messageTs,
  teamId,
}: GetTopicUrlArgs) => {
  const endpoint = `${BACKEND_API_URL}/${teamId}/${channelId}/${messageTs}`;
  const url = new URL(endpoint);
  return url;
};

export type GetTopicRepliesArgs = {
  teamId: string;
  channelId: string;
  messageTs: string;
};

export const getTopicRepliesUrl = ({
  teamId,
  channelId,
  messageTs,
}: GetTopicRepliesArgs) => {
  const endpoint = `${BACKEND_API_URL}/${teamId}/${channelId}/${messageTs}/replies`;
  const url = new URL(endpoint);
  return url;
};


export const getTopics = async ({
  teamId,
  channelId,
  take,
  cursor,
}: GetTopicsArgs) => {
  const topicUrl = getAllTopicsUrl({ teamId, channelId, take, cursor });

  const topicEndpointRes = await fetch(topicUrl);

  if (topicEndpointRes.ok) {
    const unsafeTopics = await topicEndpointRes.json();
    const validatedTopic = AllTopicsSchema.parse(unsafeTopics);

    return validatedTopic;
  }

  return new Error(`${topicEndpointRes.status} ${topicEndpointRes.statusText}`);
};

export type GetTopicArgs = {
  teamId: string;
  channelId: string;
  messageTs: string;
};

export const getTopic = async ({
  teamId,
  channelId,
  messageTs,
}: GetTopicArgs) => {
  const topicUrl = getTopicUrl({ channelId, messageTs, teamId });
  const topicEndpointRes = await fetch(topicUrl);

  if (topicEndpointRes.ok) {
    const unsafeTopic = await topicEndpointRes.json();
    const validatedTopic = TopicSchema.parse(unsafeTopic);

    return validatedTopic;
  }

  return new Error(`${topicEndpointRes.status} ${topicEndpointRes.statusText}`);
};

export type GetRepliesArgs = {
  teamId: string;
  channelId: string;
  messageTs: string;
};

export const getReplies = async ({
  channelId,
  messageTs,
  teamId,
}: GetRepliesArgs) => {
  const url = getTopicRepliesUrl({ channelId, messageTs, teamId });

  const repliesEndpointRes = await fetch(url);

  if (repliesEndpointRes.ok) {
    const unsafeReplies = await repliesEndpointRes.json();
    const validatedReplies = AllTopicsSchema.parse(unsafeReplies);

    return validatedReplies;
  }

  const status = repliesEndpointRes.status;

  if (status === 404) {
    return [];
  }

  return new Error(
    `${repliesEndpointRes.status} ${repliesEndpointRes.statusText}`
  );
};

export type GetTopicWithRepliesArgs = {
  teamId: string;
  channelId: string;
  messageTs: string;
};

export const getTopicWithReplies = async ({
  teamId,
  channelId,
  messageTs,
}: GetTopicWithRepliesArgs) => {
  const topicEndpointPromise = getTopic({ channelId, messageTs, teamId });
  const repliesEndpointPromise = getReplies({ channelId, messageTs, teamId });

  const [topicEndpointRes, repliesEndpointRes] = await Promise.all([
    topicEndpointPromise,
    repliesEndpointPromise,
  ]);

  if (topicEndpointRes instanceof Error) {
    return new Error(`Error in fetching topic`, { cause: topicEndpointRes });
  }

  if (repliesEndpointRes instanceof Error) {
    return new Error(`Error in fetching replies`, {
      cause: repliesEndpointRes,
    });
  }

  return { topic: topicEndpointRes, replies: repliesEndpointRes };
};
