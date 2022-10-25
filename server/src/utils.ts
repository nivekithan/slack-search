export type ENV_VARIABLES = "SLACK_SIGNING_SECRET" | "SLACK_BOT_TOKEN";

export const getEnvVariable = (variable: ENV_VARIABLES): string => {
  const envVariableValue = process.env[variable];

  if (envVariableValue === undefined) {
    throw new Error(`Environment variable ${variable} is not defined`);
  }

  return envVariableValue;
};
