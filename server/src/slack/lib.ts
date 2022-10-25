import { WebClient } from "@slack/web-api";
import { z } from "zod";

export type GetChannelInfoArgs = {
  channelId: string;
  accessToken: string;
};

/**
 * This schema is incomplete, containing fields only needed for now.
 * If in future more fields are needed, we have to update this schema.
 *
 * For complete schema look at https://api.slack.com/methods/conversations.info#examples
 */
const slackChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_channel: z.literal(true),
});

export const getChannelInfo = async ({
  channelId,
  accessToken,
}: GetChannelInfoArgs) => {
  const webClient = new WebClient(accessToken);
  const channelInfo = await webClient.conversations.info({
    channel: channelId,
  });

  if (!channelInfo.ok) {
    throw new Error(channelInfo.error);
  }

  return slackChannelSchema.parse(channelInfo.channel);
};
