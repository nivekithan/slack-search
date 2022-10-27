import { faker } from "@faker-js/faker";
import { Channel, Message, PrismaClient, SlackUser } from "@prisma/client";
import { nanoid } from "nanoid";

export const TEAM_ID_CRICKET = nanoid(8);
export const TEAM_ID_FOOTBALL = nanoid(8);

export const CHANNEL_ID_GENERAL = nanoid(8);
export const CHANNEL_ID_CHAT = nanoid(8);

export const TOPIC_TS_NO_REPLIES = nanoid(8);
export const TOPIC_TS_REPLIES = nanoid(8);

export const USER_TEST = nanoid(8);

const now = new Date().getTime();
const TEN_SECOND = 10 * 1000;

let increment = 0;

const autoincrement = () => {
  increment++;
  return increment;
};

const getIncreaseTime = () => {
  let currentTime = new Date().getTime();

  return () => {
    currentTime += TEN_SECOND;
    return new Date(currentTime);
  };
};

const getChannelData = (teamId: string) => {
  return [
    {
      teamId: teamId,
      channelId: CHANNEL_ID_GENERAL,
      channelName: faker.name.fullName(),
      id: nanoid(),
      createdAt: new Date(now),
      updatedAt: new Date(now),
    },
    {
      teamId: teamId,
      channelId: CHANNEL_ID_CHAT,
      channelName: faker.name.fullName(),
      id: nanoid(),
      createdAt: new Date(now + TEN_SECOND * 2),
      updatedAt: new Date(now + TEN_SECOND * 2),
    },
  ];
};

export const CHANNELS: Record<string, Channel[]> = {
  [TEAM_ID_CRICKET]: getChannelData(TEAM_ID_CRICKET),
  [TEAM_ID_FOOTBALL]: getChannelData(TEAM_ID_FOOTBALL),
};

const SLACK_USER: SlackUser[] = [
  {
    id: nanoid(8),
    createdAt: new Date(now),
    updatedAt: new Date(now),
    teamId: TEAM_ID_CRICKET,
    userId: USER_TEST,
    userRealName: faker.name.fullName(),
    userNickName: faker.name.firstName(),
  },
];

export const getCricketTopicData = (channelId: string) => {
  const increaseTime = getIncreaseTime();
  return [
    {
      teamId: TEAM_ID_CRICKET,
      channelId,
      id: `LOW-${nanoid(8)}`,
      cursorKey: autoincrement(),
      messageTs: TOPIC_TS_NO_REPLIES,
      userId: USER_TEST,
      topicMessageTs: null,
      message: faker.hacker.phrase(),
      repliesCount: 0,
      createdAt: increaseTime(),
      updatedAt: increaseTime(),
    },
    {
      teamId: TEAM_ID_CRICKET,
      channelId,
      id: nanoid(8),
      cursorKey: autoincrement(),
      messageTs: TOPIC_TS_REPLIES,
      userId: USER_TEST,
      topicMessageTs: null,
      message: faker.hacker.phrase(),
      repliesCount: 0,
      createdAt: increaseTime(),
      updatedAt: increaseTime(),
    },
    {
      teamId: TEAM_ID_CRICKET,
      channelId,
      id: nanoid(8),
      cursorKey: autoincrement(),
      messageTs: nanoid(8),
      userId: USER_TEST,
      topicMessageTs: null,
      message: faker.hacker.phrase(),
      repliesCount: 0,
      createdAt: increaseTime(),
      updatedAt: increaseTime(),
    },
    {
      teamId: TEAM_ID_CRICKET,
      channelId,
      id: nanoid(8),
      cursorKey: autoincrement(),
      messageTs: nanoid(8),
      userId: USER_TEST,
      topicMessageTs: null,
      message: faker.hacker.phrase(),
      repliesCount: 0,
      createdAt: increaseTime(),
      updatedAt: increaseTime(),
    },
    {
      teamId: TEAM_ID_CRICKET,
      channelId,
      id: nanoid(8),
      cursorKey: autoincrement(),
      messageTs: nanoid(8),
      userId: USER_TEST,
      topicMessageTs: null,
      message: faker.hacker.phrase(),
      repliesCount: 0,
      createdAt: increaseTime(),
      updatedAt: increaseTime(),
    },
    {
      teamId: TEAM_ID_CRICKET,
      channelId,
      id: nanoid(8),
      cursorKey: autoincrement(),
      messageTs: nanoid(8),
      userId: USER_TEST,
      topicMessageTs: null,
      message: faker.hacker.phrase(),
      repliesCount: 0,
      createdAt: increaseTime(),
      updatedAt: increaseTime(),
    },
  ];
};

export const CRICKET_TOPICS: Record<string, Message[]> = {
  [CHANNEL_ID_CHAT]: getCricketTopicData(CHANNEL_ID_CHAT),
  [CHANNEL_ID_GENERAL]: getCricketTopicData(CHANNEL_ID_GENERAL),
};

export const CRICKET_CHAT_REPLIES: Message[] = [
  {
    teamId: TEAM_ID_CRICKET,
    channelId: CHANNEL_ID_CHAT,
    id: nanoid(8),
    cursorKey: autoincrement(),
    messageTs: nanoid(8),
    userId: USER_TEST,
    topicMessageTs: TOPIC_TS_REPLIES,
    message: faker.hacker.phrase(),
    repliesCount: 0,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  },
  {
    teamId: TEAM_ID_CRICKET,
    channelId: CHANNEL_ID_CHAT,
    id: nanoid(8),
    cursorKey: autoincrement(),
    messageTs: nanoid(8),
    userId: USER_TEST,
    topicMessageTs: TOPIC_TS_REPLIES,
    message: faker.hacker.phrase(),
    repliesCount: 0,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  },
  {
    teamId: TEAM_ID_CRICKET,
    channelId: CHANNEL_ID_CHAT,
    id: nanoid(8),
    cursorKey: autoincrement(),
    messageTs: nanoid(8),
    userId: USER_TEST,
    topicMessageTs: TOPIC_TS_REPLIES,
    message: faker.hacker.phrase(),
    repliesCount: 0,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  },
  {
    teamId: TEAM_ID_CRICKET,
    channelId: CHANNEL_ID_CHAT,
    id: nanoid(8),
    cursorKey: autoincrement(),
    messageTs: nanoid(8),
    userId: USER_TEST,
    topicMessageTs: TOPIC_TS_REPLIES,
    message: faker.hacker.phrase(),
    repliesCount: 0,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  },
  {
    teamId: TEAM_ID_CRICKET,
    channelId: CHANNEL_ID_CHAT,
    id: nanoid(8),
    cursorKey: autoincrement(),
    messageTs: nanoid(8),
    userId: USER_TEST,
    topicMessageTs: TOPIC_TS_REPLIES,
    message: faker.hacker.phrase(),
    repliesCount: 0,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  },
  {
    teamId: TEAM_ID_CRICKET,
    channelId: CHANNEL_ID_CHAT,
    id: nanoid(8),
    cursorKey: autoincrement(),
    messageTs: nanoid(8),
    userId: USER_TEST,
    topicMessageTs: TOPIC_TS_REPLIES,
    message: faker.hacker.phrase(),
    repliesCount: 0,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  },
];

export const publicApiSeedData = async () => {
  const prisma = new PrismaClient();

  await prisma.channel.createMany({
    data: [...CHANNELS[TEAM_ID_CRICKET], ...CHANNELS[TEAM_ID_FOOTBALL]],
  });

  await prisma.slackUser.createMany({ data: SLACK_USER });

  await prisma.message.createMany({
    data: [
      ...CRICKET_TOPICS[CHANNEL_ID_CHAT],
      ...CRICKET_TOPICS[CHANNEL_ID_GENERAL],
    ],
  });

  await prisma.message.createMany({ data: [...CRICKET_CHAT_REPLIES] });
};

export const publicApiDeleteData = async () => {
  const prisma = new PrismaClient();

  await prisma.message.deleteMany({
    where: { topicMessageTs: { not: null } },
  });
  await prisma.message.deleteMany();

  await Promise.all([
    prisma.slackUser.deleteMany(),
    prisma.channel.deleteMany(),
  ]);
};
