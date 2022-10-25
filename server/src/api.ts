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

    return res.json(allChannels);
  })
);
