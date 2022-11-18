import { z } from "zod";
import { BACKEND_API_URL } from "./constant.server";
import { ZodStringToDate } from "./utils.server";

export const ChannelSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  channelId: z.string(),
  channelName: z.string(),
  createdAt: z.string().transform(ZodStringToDate),
  updatedAt: z.string().transform(ZodStringToDate),
});

export const AllChannelSchema = z.array(ChannelSchema);

export const getChannelEndPoint = (teamId: string) => {
  const url = `${BACKEND_API_URL}/${teamId}/channels`;
  return url;
};

export const getChannels = async (teamId: string) => {
  const url = getChannelEndPoint(teamId);

  const channelEndpointRes = await fetch(url);

  if (channelEndpointRes.ok) {
    const channels = await channelEndpointRes.json();
    const validatedChannels = AllChannelSchema.parse(channels);

    return validatedChannels;
  }

  return new Error("Unable to get channels");
};
