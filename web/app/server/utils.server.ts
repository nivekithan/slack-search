import type { RefinementCtx} from "zod";
import { z } from "zod";

export type EnvVarName = "BACKEND_API_URL";

export const getEnvVar = (envVarName: EnvVarName) => {
  const envVar = process.env[envVarName];
  if (!envVar) {
    throw new Error(`Missing env var ${envVarName}`);
  }
  return envVar;
};

export const ZodStringToDate = (str: string, ctx: RefinementCtx) => {
  const parsedDate = new Date(str);

  if (Number.isNaN(parsedDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not an valid date",
    });
    return z.NEVER;
  }

  return parsedDate;
};
