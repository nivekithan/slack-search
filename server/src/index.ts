import express, { RequestHandler } from "express";
import { text as parseTextBody } from "body-parser";
import {
  passUrlVerificationChallenge,
  sendAcknowledgementResponse,
  verifyRequestIsFromSlack,
} from "./slack/slackMiddleware";
import { slackEventHandler } from "./slack/eventHandler";
import { api } from "./api";
import { expressAsyncHanlder } from "./utils";

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

/**
 * API for frontend
 */
app.use("/api/v1/", api);

app.post(
  "/api/v1/slack/events",
  parseTextBody({ type: () => true }),
  verifyRequestIsFromSlack,
  passUrlVerificationChallenge,
  sendAcknowledgementResponse,
  slackEventHandler
);

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
