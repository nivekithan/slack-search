import { expressAsyncHanlder } from "../expressAsyncHandler";
import { createHmac } from "node:crypto";
import { getEnvVariable } from "../utils";

/**
 * Verifies that request really came from slack.
 *
 * If the verification is successful, the body of the request is parsed as json
 * and then passed to the next middleware.
 *
 * Reference: https://api.slack.com/authentication/verifying-requests-from-slack
 */
export const verifyRequestIsFromSlack = expressAsyncHanlder(
  async (req, res, next) => {
    const requestTimeStamp = req.headers["x-slack-request-timestamp"];

    if (typeof requestTimeStamp !== "string") {
      return res
        .status(400)
        .send(
          "Invalid request. X-Slack-Request-Timestamp header is missing or invalid"
        );
    }

    const requestTimeStampSec = parseInt(requestTimeStamp, 10);

    if (Number.isNaN(requestTimeStampSec)) {
      return res
        .status(400)
        .send(
          "Invalid request. X-Slack-Request-Timestamp header is not an number"
        );
    }

    const nowSec = Math.floor(new Date().getTime() / 1000);
    const fiveMinutesSec = 60 * 5;

    const timeDifferenceBetweenNowAndRequest = nowSec - requestTimeStampSec;
    const isFiveMinutesPassedAfterRequest =
      timeDifferenceBetweenNowAndRequest > fiveMinutesSec;

    if (isFiveMinutesPassedAfterRequest) {
      return res.status(400).send("Invalid request. Request is too old");
    }

    const slackSignature = req.headers["x-slack-signature"];

    if (typeof slackSignature !== "string") {
      return res
        .status(400)
        .send(
          "Invalid request. X-Slack-Signature header is missing or invalid"
        );
    }

    const body = req.body;

    if (typeof body !== "string") {
      return res
        .status(500)
        .send("Internal Server error, Error in parsing body");
    }

    const baseString = `v0:${requestTimeStampSec}:${body}`;
    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");
    const hmac = createHmac("sha256", SLACK_SIGNING_SECRET);
    hmac.update(baseString);

    const computedSignatureHash = `v0=${hmac.digest("hex")}`;

    if (slackSignature !== computedSignatureHash) {
      return res.status(400).send("Invalid request. Request is not from slack");
    }
    req.body = JSON.parse(body);
    next();
  }
);

/**
 * If the request is a url verification challenge, then send the challenge
 * back to slack.
 */
export const passUrlVerificationChallenge = expressAsyncHanlder(
  async (req, res, next) => {
    const body = req.body;

    if (body.type === "url_verification") {
      return res.send(body.challenge);
    }

    next();
  }
);


