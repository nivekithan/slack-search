import { z, ZodSchema } from "zod";

const getEventSchema = <Output>(innerEventSchema: ZodSchema<Output>) => {
  return z.object({
    team_id: z.string(),
    type: z.literal("event_callback"),
    event: innerEventSchema,
  });
};

export const messageEvent = getEventSchema(
  z.object({
    type: z.literal("message"),
    channel: z.string(),
    user: z.string(),
    text: z.string(),
    ts: z.string(),
    thread_ts: z.string().optional(),
  })
);

export type MessageSentEvent = z.infer<typeof messageEvent>;

export const slackEvents = messageEvent;
export type SlackEvents = z.infer<typeof slackEvents>;
