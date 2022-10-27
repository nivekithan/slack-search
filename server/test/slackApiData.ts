export const SLACK_API_CHANNEL_ID_GENERAL = "C01BQJTBGQZ";
export const SLACK_API_CHANNEL_ID_CHAT = "C01BQJTBGQZ";
export const SLACK_API_USER = "U01BQJTBGQZ";
export const SLACK_API_TEAM_ID_CRICKET = "T01BQJTBGQZ";
export const SLACK_API_TOPIC_TS = "1611234567.123456";

export const conversationInfoRes: Record<
  string,
  { ok: boolean; channel: { id: string; name: string; is_channel: boolean } }
> = {
  [SLACK_API_CHANNEL_ID_GENERAL]: {
    ok: true,
    channel: {
      id: SLACK_API_CHANNEL_ID_GENERAL,
      is_channel: true,
      name: "general",
    },
  },
  [SLACK_API_CHANNEL_ID_CHAT]: {
    ok: true,
    channel: {
      id: SLACK_API_CHANNEL_ID_CHAT,
      is_channel: true,
      name: "chat",
    },
  },
};

export const usersInfoRes: Record<
  string,
  { ok: boolean; user: { id: string; real_name: string; is_bot: boolean } }
> = {
  [SLACK_API_USER]: {
    ok: true,
    user: {
      id: SLACK_API_USER,
      is_bot: false,
      real_name: "Test User",
    },
  },
};
