import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import { getEnvVariable } from "../utils";
import { MessageSentEvent } from "./eventSchema";
import { getChannelInfo, getUserInfo } from "./lib";

/**
 * This function should be called when a message is sent in a channel. That message is
 * then saved in database.
 *
 * - If the message came from previous unknown channel then that channel is
 * also created in database.
 *
 * - If the message contains thread_ts then that message is saved as a reply to
 * the message whose messageTs is equal to thread_ts.
 *
 */
export const hanldeMessageSentEvent = async (eventPaylod: MessageSentEvent) => {
  const event = eventPaylod.event;
  const channelId = event.channel;
  const teamId = eventPaylod.team_id;
  const userId = event.user;

  // TODO: Get Token for each workspace from the
  // database and use it to get channel info

  const accessToken = getEnvVariable("SLACK_BOT_TOKEN");
  const [channelInfo, userInfo] = await Promise.all([
    getChannelInfo({ accessToken, channelId }),
    getUserInfo({ accessToken, userId }),
  ]);
  const isMessagePartOfTopic = event.thread_ts !== undefined;

  return Promise.all([
    prisma.message.create({
      data: {
        id: nanoid(),
        message: event.text,
        messageTs: event.ts,
        slackUser: {
          connectOrCreate: {
            where: {
              teamId_userId: {
                teamId: teamId,
                userId: userId,
              },
            },
            create: {
              id: nanoid(),
              teamId: teamId,
              userId: userId,
              userRealName: userInfo.real_name,
              /**
               * TODO: Automatically create a nickname for the user
               * and the update the userNickName with that value
               */
              userNickName: `nick-${userInfo.real_name}`,
            },
          },
        },
        topic: isMessagePartOfTopic
          ? {
              connect: {
                channelId_messageTs_teamId: {
                  channelId: channelId,
                  messageTs: event.thread_ts!,
                  teamId: teamId,
                },
              },
            }
          : undefined,
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
    }),
    /**
     * Increases repliesCount of message if the new message created previously is
     * a reply to a message whose messageTs is equal to thread_ts
     *
     */
    (async function increaseRepliesCount() {
      if (isMessagePartOfTopic) {
        return prisma.message.update({
          where: {
            channelId_messageTs_teamId: {
              channelId,
              messageTs: event.thread_ts!,
              teamId,
            },
          },
          /**
           * Increment the repliesCount atomically by 1
           */
          data: {
            repliesCount: {
              increment: 1,
            },
          },
        });
      }
    })(),
  ]);
};
