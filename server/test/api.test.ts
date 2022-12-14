import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  convertCreatedAtAndUpdateAtDateToString,
  sortCreatedAtDesc,
  teamIdIs,
} from "./util";
import {
  CHANNELS,
  CHANNEL_ID_CHAT,
  CHANNEL_ID_GENERAL,
  CRICKET_CHAT_REPLIES,
  CRICKET_TOPICS,
  publicApiDeleteData,
  publicApiSeedData,
  TEAM_ID_CRICKET,
  TEAM_ID_FOOTBALL,
  TOPIC_TS_NO_REPLIES,
  TOPIC_TS_REPLIES,
} from "./publicApiData";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import {
  conversationInfoRes,
  SLACK_API_CHANNEL_ID_CHAT,
  SLACK_API_TEAM_ID_CRICKET,
  SLACK_API_TOPIC_TS,
  SLACK_API_USER,
} from "./slackApiData";

const SERVER_URL = "http://localhost:8080";
const BASE_API_URL = `${SERVER_URL}/api/v1`;
const SLACK_EVENT_URL = `${BASE_API_URL}/slack/events`;

/**
 * Wait for 1000ms before running the tests
 */
beforeAll(async () => {
  return new Promise((r) => setTimeout(r, 1000));
});

describe.concurrent("Public facing api endpoints", () => {
  beforeAll(async () => {
    await publicApiDeleteData();
    await publicApiSeedData();
  });

  it("GET /healthcheck", async () => {
    const HEALTH_CHECK_URL = `${SERVER_URL}/healthcheck`;
    const response = await fetch(HEALTH_CHECK_URL);

    const statusCode = response.status;
    const message = response.statusText;

    expect(statusCode).toBe(200);
    expect(message).toBe("OK");
  });

  it("GET /:teamId/channels; teamId=CIRCKET", async () => {
    const response = await fetch(`${BASE_API_URL}/${TEAM_ID_CRICKET}/channels`);

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      CHANNELS[TEAM_ID_CRICKET].filter(teamIdIs(TEAM_ID_CRICKET)).map(
        convertCreatedAtAndUpdateAtDateToString
      )
    );
  });

  it("GET /:teamId/channels; teamId=FOOTBALL", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_FOOTBALL}/channels`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      CHANNELS[TEAM_ID_FOOTBALL].filter(teamIdIs(TEAM_ID_FOOTBALL)).map(
        convertCreatedAtAndUpdateAtDateToString
      )
    );
  });

  it("GET /:teamId/channels; teamId=INVALID", async () => {
    const response = await fetch(`${BASE_API_URL}/INVALID/channels`);

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/topics; teamId=CIRCKET, channelId=GENERAL", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      [...CRICKET_TOPICS[CHANNEL_ID_GENERAL]]
        .sort(sortCreatedAtDesc)
        .map(convertCreatedAtAndUpdateAtDateToString)
    );
  });

  describe("GET /:teamId/:channelId/topics; teamId=CRICKET, channelId=GENERALl; Pagination", () => {
    let firstResponseLastTopicKey: null | number = null;
    let firstResponseFirstTopicKey: null | number = null;
    it("No cursor, mode passed; take = 3", async () => {
      const url = new URL(
        `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
      );

      const queryParams = url.searchParams;

      queryParams.set("take", "3");

      const response = await fetch(url.toString());

      const statusCode = response.status;
      expect(statusCode).toBe(200);

      const responseObj = await response.json();

      expect(responseObj).toEqual(
        CRICKET_TOPICS[CHANNEL_ID_GENERAL].sort(sortCreatedAtDesc)
          .slice(0, 3)
          .map(convertCreatedAtAndUpdateAtDateToString)
      );

      firstResponseLastTopicKey = responseObj.at(-1).cursorKey as number;
      firstResponseFirstTopicKey = responseObj.at(0).cursorKey as number;
    });

    let secondResponseFirstTopicKey: number | null = null;
    let secondResponseLastTopicKey: number | null = null;
    it("No mode passed; take=3, cursor is firstResponseLastTopic cursorKey", async () => {
      const url = new URL(
        `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
      );

      const queryParams = url.searchParams;

      expect(firstResponseLastTopicKey).not.toBeNull();
      expect(firstResponseLastTopicKey).not.toBeUndefined();

      queryParams.set("cursor", `${firstResponseLastTopicKey}`);
      queryParams.set("take", "3");

      const response = await fetch(url.toString());
      const responseObj = await response.json();

      const statusCode = response.status;
      expect(statusCode).toBe(200);

      expect(responseObj).toEqual(
        CRICKET_TOPICS[CHANNEL_ID_GENERAL].sort(sortCreatedAtDesc)
          .slice(3, 6)
          .map(convertCreatedAtAndUpdateAtDateToString)
      );

      secondResponseFirstTopicKey = responseObj[0].cursorKey;
      secondResponseLastTopicKey = responseObj.at(-1).cursorKey;
    });

    it("take=3, mode=reverse, cursor is secondResponseFirstTopic cursorKey", async () => {
      const url = new URL(
        `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
      );

      const queryParams = url.searchParams;

      expect(secondResponseFirstTopicKey).not.toBeNull();
      expect(secondResponseFirstTopicKey).not.toBeUndefined();

      queryParams.set("cursor", `${secondResponseFirstTopicKey}`);
      queryParams.set("take", "3");
      queryParams.set("mode", "reverse");

      const response = await fetch(url.toString());
      const responseObj = await response.json();

      const statusCode = response.status;
      expect(statusCode).toBe(200);

      expect(responseObj).toEqual(
        CRICKET_TOPICS[CHANNEL_ID_GENERAL].sort(sortCreatedAtDesc)
          .slice(0, 3)
          .map(convertCreatedAtAndUpdateAtDateToString)
      );
    });

    describe("404 Requests", async () => {
      it("No mode passed; take=3, cursor is secondResponseLastTopic cursorKey", async () => {
        const url = new URL(
          `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
        );

        const queryParams = url.searchParams;

        expect(secondResponseLastTopicKey).not.toBeNull();
        expect(secondResponseLastTopicKey).not.toBeUndefined();

        queryParams.set("cursor", `${secondResponseLastTopicKey}`);
        queryParams.set("take", "3");

        const response = await fetch(url.toString());

        const statusCode = response.status;
        expect(statusCode).toBe(404);
      });

      it("take=3, mode=reverse, cursor is firstResponseFirstTopic cursorKey", async () => {
        const url = new URL(
          `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
        );

        const queryParams = url.searchParams;

        expect(firstResponseFirstTopicKey).not.toBeNull();
        expect(firstResponseFirstTopicKey).not.toBeUndefined();

        queryParams.set("cursor", `${firstResponseFirstTopicKey}`);
        queryParams.set("take", "3");
        queryParams.set("mode", "reverse");

        const response = await fetch(url.toString());

        const statusCode = response.status;
        expect(statusCode).toBe(404);
      });
    });

    it.concurrent("No cursor; mode=reverse, take=3", async () => {
      const url = new URL(
        `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
      );

      const queryParams = url.searchParams;

      queryParams.set("take", "3");
      queryParams.set("mode", "reverse");

      const response = await fetch(url.toString());
      const responseObj = await response.json();

      const statusCode = response.status;
      expect(statusCode).toBe(200);

      expect(responseObj).toEqual(
        CRICKET_TOPICS[CHANNEL_ID_GENERAL].sort(sortCreatedAtDesc)
          .slice(3, 6)
          .map(convertCreatedAtAndUpdateAtDateToString)
      );
    });

    describe.concurrent("Bad requests", () => {
      it("mode=INVALID", async () => {
        const url = new URL(
          `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
        );

        const queryParams = url.searchParams;

        queryParams.set("mode", "INVALID");

        const response = await fetch(url.toString());
        const statusCode = response.status;
        expect(statusCode).toBe(400);
      });

      it("take=INVALID", async () => {
        const url = new URL(
          `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
        );

        const queryParams = url.searchParams;

        queryParams.set("take", "INVALID");

        const response = await fetch(url.toString());
        const statusCode = response.status;
        expect(statusCode).toBe(400);
      });

      it("cursor=INVALID", async () => {
        const url = new URL(
          `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_GENERAL}/topics`
        );

        const queryParams = url.searchParams;

        queryParams.set("cursor", "INVALID");

        const response = await fetch(url.toString());
        const statusCode = response.status;
        expect(statusCode).toBe(400);
      });
    });
  });

  it("GET /:teamId/:channelId/topics; teamId=CIRCKET, channelId=CHAT", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_CHAT}/topics`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      [...CRICKET_TOPICS[CHANNEL_ID_CHAT]]
        .sort(sortCreatedAtDesc)
        .map(convertCreatedAtAndUpdateAtDateToString)
    );
  });

  it("GET /:teamId/:channelId/topics; teamId=CIRCKET, channelId=INVALID", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/INVALID/topics`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/topics; teamId=INVALID, channelId=GENERAL", async () => {
    const response = await fetch(
      `${BASE_API_URL}/INVALID/${CHANNEL_ID_GENERAL}/topics`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/:messageTs/replies; teamId=CIRCKET, channelId=CHAT, messageTs=TOPIC_TS_REPLIES ", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_CHAT}/${TOPIC_TS_REPLIES}/replies`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      [...CRICKET_CHAT_REPLIES]
        .sort(sortCreatedAtDesc)
        .map(convertCreatedAtAndUpdateAtDateToString)
    );
  });

  it("GET /:teamId/:channelId/:messageTs/replies; teamId=CIRCKET, channelId=CHAT, messageTs=TOPIC_TS_NO_REPLIES ", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_CHAT}/${TOPIC_TS_NO_REPLIES}/replies`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/:messageTs/replies; teamId=CIRCKET, channelId=CHAT, messageTs=INVALID ", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_CHAT}/INVALID/replies`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/:messageTs/replies; teamId=CIRCKET, channelId=INVALID, messageTs=TOPIC_TS_REPLIES ", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/INVALID/${TOPIC_TS_REPLIES}/replies`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/:messageTs/replies; teamId=INVALID, channelId=CHAT, messageTs=TOPIC_TS_REPLIES ", async () => {
    const response = await fetch(
      `${BASE_API_URL}/INVALID/${CHANNEL_ID_CHAT}/${TOPIC_TS_REPLIES}/replies`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/:messageTs; teamID=CRICKET, channelId=CHAT, messageTs=TOPIC_TEST_REPLIES", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_CHAT}/${TOPIC_TS_REPLIES}`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      convertCreatedAtAndUpdateAtDateToString(
        CRICKET_TOPICS[CHANNEL_ID_CHAT].find(
          (topic) => topic.messageTs === TOPIC_TS_REPLIES
        )!
      )
    );
  });

  it("GET /:teamId/:channelId/:messageTs; teamId=CRICKET, channelId=CHAT, messageTs=INVALID", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/${CHANNEL_ID_CHAT}/INVALID`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/:messageTs; teamId=CRICKET, channelId=INVALID, messageTs=TOPIC_TEST_REPLIES", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_CRICKET}/INVALID/${TOPIC_TS_REPLIES}`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  it("GET /:teamId/:channelId/:messageTs; teamId=INVALID, channelId=CHAT, messageTs=TOPIC_TEST_REPLIES", async () => {
    const response = await fetch(
      `${BASE_API_URL}/INVALID/${CHANNEL_ID_CHAT}/${TOPIC_TS_REPLIES}`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(404);
  });

  afterAll(async () => {
    await publicApiDeleteData();
  });
});

describe.concurrent("Slack facing endpoints", () => {
  beforeAll(async () => {
    await publicApiDeleteData();
  });

  it("SlackSendMessage event", async () => {
    const prisma = new PrismaClient();

    const eventBody = {
      team_id: SLACK_API_TEAM_ID_CRICKET,
      type: "event_callback",
      event: {
        type: "message",
        channel: SLACK_API_CHANNEL_ID_CHAT,
        user: SLACK_API_USER,
        text: faker.hacker.phrase(),
        ts: SLACK_API_TOPIC_TS,
      },
    };

    const response = await fetch(SLACK_EVENT_URL, {
      method: "POST",
      body: JSON.stringify(eventBody),
    });

    const statusCode = response.status;

    expect(statusCode).toBe(200);

    await new Promise((r) => setTimeout(r, 100));

    const [channel, message] = await Promise.all([
      prisma.channel.findUnique({
        where: {
          teamId_channelId: {
            channelId: SLACK_API_CHANNEL_ID_CHAT,
            teamId: SLACK_API_TEAM_ID_CRICKET,
          },
        },
      }),

      prisma.message.findUnique({
        where: {
          channelId_messageTs_teamId: {
            channelId: SLACK_API_CHANNEL_ID_CHAT,
            messageTs: SLACK_API_TOPIC_TS,
            teamId: SLACK_API_TEAM_ID_CRICKET,
          },
        },
      }),
    ]);

    expect(channel).not.toBeNull();

    expect({
      ...channel,
      id: "ignore",
      createdAt: "ignore",
      updatedAt: "ignore",
    }).toEqual({
      id: "ignore",
      createdAt: "ignore",
      updatedAt: "ignore",
      teamId: SLACK_API_TEAM_ID_CRICKET,
      channelId: SLACK_API_CHANNEL_ID_CHAT,
      channelName: conversationInfoRes[SLACK_API_CHANNEL_ID_CHAT].channel.name,
    });

    expect(message).not.toBeNull();

    expect({
      ...message,
      id: "ignore",
      cursorKey: "ignore",
      createdAt: "ignore",
      updatedAt: "ignore",
    }).toEqual({
      id: "ignore",
      cursorKey: "ignore",
      createdAt: "ignore",
      updatedAt: "ignore",
      teamId: SLACK_API_TEAM_ID_CRICKET,
      channelId: SLACK_API_CHANNEL_ID_CHAT,
      messageTs: SLACK_API_TOPIC_TS,
      userId: SLACK_API_USER,
      topicMessageTs: null,
      repliesCount: 0,

      message: eventBody.event.text,
    });
  });

  afterAll(async () => {
    await publicApiDeleteData();
  });
});
