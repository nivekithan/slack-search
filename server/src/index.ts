import express, { RequestHandler } from "express";
import { text as parseTextBody } from "body-parser";
import { expressAsyncHanlder } from "./expressAsyncHandler";
import {
  passUrlVerificationChallenge,
  sendAcknowledgementResponse,
  verifyRequestIsFromSlack,
} from "./slack/hanldeSlackEventRequests";
import { slackEvent } from "./slack/eventSchema";
import { prisma } from "./prisma";
import { nanoid } from "nanoid";

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
  async (req, _, next) => {
    /**
     * Acknowledge response has already been sent to slack.
     * Therefore we should not use res anymore.
     */
    try {
      const body = slackEvent.parse(req.body);

      const innerEvent = body.event;
      const innerEventType = innerEvent.type;

      if (innerEventType === "message") {
        // Save message to database
        await prisma.message.create({
          data: {
            channelId: innerEvent.channel,
            userId: innerEvent.user,
            message: innerEvent.text,
            messageTs: innerEvent.ts,
            id: nanoid(),
          },
        });

        console.log("Message saved to database");
      }
    } catch (err) {
      next(err);
    }
  }
);

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
