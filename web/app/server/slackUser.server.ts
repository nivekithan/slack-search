import { z } from "zod";
import { ZodStringToDate } from "./utils.server";

export const SlackUserSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  userId: z.string(),
  userRealName: z.string(),
  userNickName: z.string(),
  createdAt: z.string().transform(ZodStringToDate),
  updatedAt: z.string().transform(ZodStringToDate),
});
