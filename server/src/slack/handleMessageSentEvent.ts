import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getEnvVariable } from "../utils";
import { MessageSentEvent } from "./eventSchema";
import { getChannelInfo } from "./lib";



/**
 * This function should be called when a message is sent in a channel.
 * 
 * That message is then saved in database. If the message came from previous unknown channel
 * then that channel is also created in database.
 * 
 */
export const hanldeMessageSentEvent = async (eventPaylod: MessageSentEvent) => {
  const event = eventPaylod.event;

  const channelId = event.channel;
  const teamId = eventPaylod.team_id;

  // TODO: Get Token for each workspace from the
  // database and use it to get channel info

  const accessToken = getEnvVariable("SLACK_BOT_TOKEN");

  const channelInfo = await getChannelInfo({ accessToken, channelId });

  return prisma.message.create({
    data: {
      id: nanoid(),
      message: event.text,
      messageTs: event.ts,
      userId: event.user,
      channel: {
        connectOrCreate: {
          where: {
            teamId_channelId: {
              channelId: channelId,
              teamId: teamId,
            },
          },
          create: {
            channelId: channelId,
            channelName: channelInfo.name,
            id: nanoid(),
            teamId: teamId,
          },
        },
      },
    },
  });
};
