import { expressAsyncHanlder } from "../expressAsyncHandler";
import { slackEvents } from "./eventSchema";
import { hanldeMessageSentEvent } from "./handleMessageSentEvent";

export const slackEventHandler = expressAsyncHanlder(async (req) => {
  /**
   * Acknowledge response has already been sent to slack.
   * Therefore we should not use res anymore.
   */
  const eventPayloadParseRes = slackEvents.safeParse(req.body);

  if (!eventPayloadParseRes.success) {
    /**
     * This event payload is not something which we are interested in/supported.
     * Therefore we should not do anything and ignore this event
     */
    return;
  }

  const eventPayload = eventPayloadParseRes.data;
  const event = eventPayload.event;
  const eventType = event.type;

  if (eventType === "message") {
    return hanldeMessageSentEvent(eventPayload);
  }
});
