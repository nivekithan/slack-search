import { setupServer } from "msw/node";
import { rest } from "msw";
import { getEnvVariable } from "../../src/utils";
import { conversationInfoRes, usersInfoRes } from "../slackApiData";
import { getAuthorizationToken, parseFormUrlEncoded } from "../util";

const SLACK_API_URL = `https://slack.com/api`;

export const server = setupServer(
  rest.post(`${SLACK_API_URL}/conversations.info`, async (req, res, ctx) => {
    const passedToken = getAuthorizationToken(req);

    const expectedBotToken = getEnvVariable("SLACK_BOT_TOKEN");

    if (passedToken !== expectedBotToken) {
      return res(ctx.status(401));
    }

    const bodyText = await req.text();

    const parsedBodyText = parseFormUrlEncoded(bodyText);

    const channelId = parsedBodyText.get("channel");

    if (!channelId) {
      return res(ctx.status(400));
    }

    const channelResObj = conversationInfoRes[channelId];

    if (channelResObj === undefined) {
      return res(ctx.status(404));
    }

    return res(ctx.json(channelResObj));
  }),

  rest.post(`${SLACK_API_URL}/users.info`, async (req, res, ctx) => {
    const passedToken = getAuthorizationToken(req);

    const expectedBotToken = getEnvVariable("SLACK_BOT_TOKEN");

    if (passedToken !== expectedBotToken) {
      return res(ctx.status(401));
    }

    const bodyText = await req.text();
    const parseBodyText = parseFormUrlEncoded(bodyText);

    const userId = parseBodyText.get("user");

    if (!userId) {
      return res(ctx.status(400));
    }

    const userResObj = usersInfoRes[userId];

    if (userResObj === undefined) {
      return res(ctx.status(404));
    }

    return res(ctx.json(userResObj));
  })
);
