import { z } from "zod";

export const SlackUserSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  userId: z.string(),
  userRealName: z.string(),
  userNickName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
