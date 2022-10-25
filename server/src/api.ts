import { Router } from "express";
import { expressAsyncHanlder } from "./expressAsyncHandler";
import { prisma } from "./prisma";

export const api = Router();

/**
 * Gets all known channels for a team
 *
 * TODO:
 *
 * - Add pagination support for channel.findMany method
 */
api.get(
  "/:teamId/channels",
  expressAsyncHanlder(async (req, res) => {
    const teamId = req.params.teamId as string;

    const allChannels = await prisma.channel.findMany({
      where: { teamId: teamId },
    });

    if (allChannels.length === 0) {
      return res.status(404).send(`No channels found for team ${teamId}`);
    }

    return res.json(allChannels);
  })
);

/**
 * Gets all topics for a channel.
 *
 * TODO:
 *
 * - Add pagination support for this endpoint
 */
api.get(
  "/:teamId/:channelId/topics",
  expressAsyncHanlder(async (req, res) => {
    const teamId = req.params.teamId as string;
    const channelId = req.params.channelId as string;

    const allTopics = await prisma.message.findMany({
      where: { channelId: channelId, teamId: teamId },
    });

    if (allTopics.length === 0) {
      return res.status(404).send(`No topics found for team ${teamId}`);
    }

    return res.json(allTopics);
  })
);

api.get(
  "/:teamId/:channelId/:messageTs",
  expressAsyncHanlder(async (req, res) => {
    const teamId = req.params.teamId as string;
    const channelId = req.params.channelId as string;
    const messageTs = req.params.messageTs as string;

    const message = await Promise.all([
      prisma.message.findUnique({
        where: { channelId_messageTs_teamId: { channelId, messageTs, teamId } },
      }),
    ]);

    if (!message) {
      return res.status(404).send(`No message found for team ${teamId}`);
    }
    return res.json(message);
  })
);

api.get(
  "/:teamId/:channelId/:messageTs/replies",
  expressAsyncHanlder(async (req, res) => {
    const teamId = req.params.teamId as string;
    const channelId = req.params.channelId as string;
    const messageTs = req.params.messageTs as string;

    const allReplies = await prisma.message.findMany({
      where: {
        channelId: channelId,
        teamId: teamId,
        topicMessageTs: messageTs,
      },
    });

    if (allReplies.length === 0) {
      return res.status(404).send(`No replies found for team ${teamId}`);
    }

    return res.json(allReplies);
  })
);
