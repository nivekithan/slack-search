import express, { RequestHandler } from "express";
import { text as parseTextBody } from "body-parser";
import { expressAsyncHanlder } from "./expressAsyncHandler";
import {
  passUrlVerificationChallenge,
  sendAcknowledgementResponse,
  verifyRequestIsFromSlack,
} from "./slack/slackMiddleware";
import { slackEvents } from "./slack/eventSchema";
import { hanldeMessageSentEvent } from "./slack/handleMessageSentEvent";

const app = express();

const exceptSlack = (fn: RequestHandler) => {
  const newRequestHandler: RequestHandler = (req, res, next) => {
    const invalidPostRoutesForJsonMiddleware = ["/api/v1/slack/events"];
    if (
      invalidPostRoutesForJsonMiddleware.includes(req.path) &&
      req.method === "POST"
    ) {
      next();
    } else {
      fn(req, res, next);
    }
  };

  return newRequestHandler;
};

app.use("/", exceptSlack(express.json()));

app.use(
  "/healthcheck",
  expressAsyncHanlder(async (req, res) => {
    return res.send("OK");
  })
);

app.post(
  "/api/v1/slack/events",
  parseTextBody({ type: () => true }),
  verifyRequestIsFromSlack,
  passUrlVerificationChallenge,
  sendAcknowledgementResponse,
  expressAsyncHanlder(async (req, _) => {
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
  })
);

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
