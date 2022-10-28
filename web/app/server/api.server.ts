import { getEnvVar } from "./utils.server";
import { z } from "zod";

const ChannelSchema = z.array(
  z.object({
    id: z.string(),
    teamId: z.string(),
    channelId: z.string(),
    channelName: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
);

export type Channels = z.infer<typeof ChannelSchema>;

export const getChannelsForTeam = async (teamId: string) => {
  const CHANNEL_ENDPOINT = `${getEnvVar(
    "BACKEND_API_URL"
  )}/api/v1/${teamId}/channels`;

  const channelRes = await fetch(CHANNEL_ENDPOINT);

  const statusCode = channelRes.status;

  if (statusCode === 404) {
    return [];
  }

  const channels = ChannelSchema.parse(await channelRes.json());

  return channels;
};
