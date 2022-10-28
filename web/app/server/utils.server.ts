import invariant from "tiny-invariant";

export type ENV_VAR = "BACKEND_API_URL";

export const getEnvVar = (envVar: ENV_VAR) => {
  const envVarValue = process.env[envVar];

  invariant(envVarValue, `Missing env var ${envVar}`);

  return envVarValue;
};
