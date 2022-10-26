import { Channel, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
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
  deleteData,
  seedData,
  TEAM_ID_CRICKET,
  TEAM_ID_FOOTBALL,
  TOPIC_TS_NO_REPLIES,
  TOPIC_TS_REPLIES,
} from "./data";

const SERVER_URL = "http://localhost:8080";
const BASE_API_URL = `${SERVER_URL}/api/v1`;

/**
 * Wait for 1000ms before running the tests
 */
beforeAll(async () => {
  return new Promise((r) => setTimeout(r, 1000));
});

describe.concurrent("Public facing api endpoints", () => {
  beforeAll(async () => {
    await deleteData();
    await seedData();
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
    await deleteData();
  });
});
