import { trace } from "@opentelemetry/api";
import { getEnvVariable } from "./utils";

export const logger = (msg: string, ...data: unknown[]) => {
  try {
    if (getEnvVariable("NODE_ENV") !== "production") {
      console.log(msg, ...data);
    }
    const activeSpan = trace.getActiveSpan();

    if (activeSpan) {
      activeSpan.addEvent(`${msg} ${data}`);
    }
  } catch (err) {
    // TODO: Add error logging
  }
};

logger.setTeam = (teamId: string) => {
  try {
    if (getEnvVariable("NODE_ENV") !== "production") {
      console.log(`Setting team to ${teamId}`);
    }

    const activeSpan = trace.getActiveSpan();

    if (activeSpan) {
      activeSpan.setAttribute("slack.teamId", teamId);
    }
  } catch (err) {}
};

logger.setChannel = (channelId: string) => {
  try {
    if (getEnvVariable("NODE_ENV") !== "production") {
      console.log(`Setting channel to ${channelId}`);
    }

    const activeSpan = trace.getActiveSpan();

    if (activeSpan) {
      activeSpan.setAttribute("slack.channelId", channelId);
    }
  } catch (err) {}
};

logger.setUser = (userId: string) => {
  try {
    if (getEnvVariable("NODE_ENV") !== "production") {
      console.log(`Setting user to ${userId}`);
    }

    const activeSpan = trace.getActiveSpan();

    if (activeSpan) {
      activeSpan.setAttribute("slack.userId", userId);
    }
  } catch (err) {}
};


