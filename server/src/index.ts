import express, { RequestHandler } from "express";
import { text as parseTextBody } from "body-parser";
import { expressAsyncHanlder } from "./expressAsyncHandler";
import {
  passUrlVerificationChallenge,
  sendAcknowledgementResponse,
  verifyRequestIsFromSlack,
} from "./slack/hanldeSlackEventRequests";

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
  async (req, res, next) => {
    /**
     * Acknowledge request has already been sent to slack.
     * Therefore we should not use res anymore.
     */
    try {
      const body = req.body;
    } catch (err) {
      next(err);
    }
  }
);

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
