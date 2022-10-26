import { Channel, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { convertCreatedAtAndUpdateAtDateToString, teamIdIs } from "./util";

const SERVER_URL = "http://localhost:8080";
const BASE_API_URL = `${SERVER_URL}/api/v1`;

/**
 * Wait for 1000ms before running the tests
 */
beforeAll(async () => {
  return new Promise((r) => setTimeout(r, 1000));
});

describe.concurrent("Public facing api endpoints", () => {
  const TEAM_ID_CRICKET = nanoid(8);
  const TEAM_ID_FOOTBALL = nanoid(8);

  const channels = ((): Channel[] => {
    const currentTime = new Date().getTime();
    const TEN_SECOND = 10 * 1000;

    return [
      {
        channelId: nanoid(8),
        channelName: faker.name.fullName(),
        id: nanoid(),
        teamId: TEAM_ID_CRICKET,

        createdAt: new Date(currentTime),
        updatedAt: new Date(currentTime),
      },
      {
        channelId: nanoid(8),
        channelName: faker.name.fullName(),
        id: nanoid(),
        teamId: TEAM_ID_CRICKET,

        createdAt: new Date(currentTime + TEN_SECOND),
        updatedAt: new Date(currentTime + TEN_SECOND),
      },
      {
        channelId: nanoid(8),
        channelName: faker.name.fullName(),
        id: nanoid(),
        teamId: TEAM_ID_CRICKET,

        createdAt: new Date(currentTime + TEN_SECOND * 2),
        updatedAt: new Date(currentTime + TEN_SECOND * 2),
      },
      {
        channelId: nanoid(8),
        channelName: faker.name.fullName(),
        id: nanoid(),
        teamId: TEAM_ID_FOOTBALL,

        createdAt: new Date(currentTime),
        updatedAt: new Date(currentTime),
      },
      {
        channelId: nanoid(8),
        channelName: faker.name.fullName(),
        id: nanoid(),
        teamId: TEAM_ID_FOOTBALL,

        createdAt: new Date(currentTime + TEN_SECOND),
        updatedAt: new Date(currentTime + TEN_SECOND),
      },
      {
        channelId: nanoid(8),
        channelName: faker.name.fullName(),
        id: nanoid(),
        teamId: TEAM_ID_FOOTBALL,

        createdAt: new Date(currentTime + TEN_SECOND * 2),
        updatedAt: new Date(currentTime + TEN_SECOND * 2),
      },
    ];
  })();

  beforeAll(async () => {
    const seedDatabase = async () => {
      const prisma = new PrismaClient();

      return prisma.channel.createMany({ data: channels });
    };

    await seedDatabase();
  });

  it("GET /healthcheck", async () => {
    const HEALTH_CHECK_URL = `${SERVER_URL}/healthcheck`;
    const response = await fetch(HEALTH_CHECK_URL);

    const statusCode = response.status;
    const message = response.statusText;

    expect(statusCode).toBe(200);
    expect(message).toBe("OK");
  });

  it("GET /:teamId/channels ; teamId=CIRCKET", async () => {
    const response = await fetch(`${BASE_API_URL}/${TEAM_ID_CRICKET}/channels`);

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      channels
        .filter(teamIdIs(TEAM_ID_CRICKET))
        .map(convertCreatedAtAndUpdateAtDateToString)
    );
  });

  it("GET /:teamId/channels ; teamId=FOOTBALL", async () => {
    const response = await fetch(
      `${BASE_API_URL}/${TEAM_ID_FOOTBALL}/channels`
    );

    const statusCode = response.status;
    expect(statusCode).toBe(200);

    const responseObj = await response.json();

    expect(responseObj).toEqual(
      channels
        .filter(teamIdIs(TEAM_ID_FOOTBALL))
        .map(convertCreatedAtAndUpdateAtDateToString)
    );
  });

  afterAll(async () => {
    const prisma = new PrismaClient();
    await prisma.channel.deleteMany();
  });
});
