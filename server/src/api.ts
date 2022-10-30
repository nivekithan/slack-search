import { Router } from "express";
import { z } from "zod";
import { logger } from "./logger";
import { prisma } from "./prisma";
import { expressAsyncHanlder, transformZodStringToNumber } from "./utils";

export const api = Router();

/**
 * Gets all known channels for a team
 */
api.get(
  "/:teamId/channels",
  expressAsyncHanlder(async (req, res) => {
    const teamId = req.params.teamId as string;
    logger.setTeam(teamId);
    logger(`Getting channels for team ${teamId}`);

    const allChannels = await prisma.channel.findMany({
      where: { teamId: teamId },
    });

    if (allChannels.length === 0) {
      logger(`No channels found for team ${teamId}`);
      return res.status(404).send(`No channels found for team ${teamId}`);
    }

    logger(`Found ${allChannels.length} channels for team ${teamId}`);
    return res.json(allChannels);
  })
);

const topicsQuerySchema = z.object({
  cursor: z.string().transform(transformZodStringToNumber).optional(),
  take: z
    .string()
    .transform(transformZodStringToNumber)
    .superRefine((takeValue, ctx) => {
      if (takeValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 100,
          inclusive: true,
          type: "number",
          message: "Take value cannot be greater than 100",
        });
      }
    })
    .optional(),
  mode: z.literal("reverse").optional(),
});
/**
 * Gets paginated topics for a specific channel.
 */
api.get(
  "/:teamId/:channelId/topics",
  expressAsyncHanlder(async (req, res) => {
    const teamId = req.params.teamId as string;
    const channelId = req.params.channelId as string;

    logger.setTeam(teamId);
    logger.setChannel(channelId);
    logger(`Getting topics`);

    const parsedQuery = topicsQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      /**
       * Unknown/unsupported query params are passed to this endpoint, so we need to
       * return a 400 error.
       **/
      logger("Invalid query params", req.query);
      return res.status(400).send(parsedQuery.error);
    }

    logger("Query params are parsed successfully", parsedQuery.data);

    const query = parsedQuery.data;

    const isReverseMode = query.mode === "reverse";

    const cursorKey = query.cursor;
    const isCursorPresent = cursorKey !== undefined;
    const cursor = isCursorPresent ? { cursorKey: cursorKey } : undefined;

    /**
     * When we pass the cursor, the query response will also contain the cursor row.
     * We need to skip the cursor row, so we add 1 to the skip value.
     * If the cursor is not present, we don't need to skip any rows.
     */
    const skip = isCursorPresent ? 1 : 0;
    const take = (query.take ?? 100) * (isReverseMode ? -1 : 1);

    const allTopics = await prisma.message.findMany({
      where: {
        channelId: channelId,
        teamId: teamId,
        topicMessageTs: { equals: null },
      },
      orderBy: {
        cursorKey: "desc",
      },
      cursor,
      take,
      skip,
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

    const message = await prisma.message.findUnique({
      where: { channelId_messageTs_teamId: { channelId, messageTs, teamId } },
    });

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
      orderBy: {
        createdAt: "desc",
      },
    });

    if (allReplies.length === 0) {
      return res.status(404).send(`No replies found for team ${teamId}`);
    }

    return res.json(allReplies);
  })
);
