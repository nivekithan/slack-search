import { RefinementCtx, z } from "zod";
import { RequestHandler } from "express";

export type ENV_VARIABLES = "SLACK_SIGNING_SECRET" | "SLACK_BOT_TOKEN";

export const getEnvVariable = (variable: ENV_VARIABLES): string => {
  const envVariableValue = process.env[variable];

  if (envVariableValue === undefined) {
    throw new Error(`Environment variable ${variable} is not defined`);
  }

  return envVariableValue;
};

/**
 * Zod transform function to validate that a string is a number and transform
 * to a number.
 *
 * If the string is not a number, it will add an issue to the context.
 *
 */
export const transformZodStringToNumber = (
  output: string,
  ctx: RefinementCtx
) => {
  const parsedValue = parseInt(output, 10);

  if (Number.isNaN(parsedValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number",
    });

    return z.NEVER;
  }

  return parsedValue;
};

export const expressAsyncHanlder = (
  callback: RequestHandler
): RequestHandler => {
  const newRequestHandler: RequestHandler = (req, res, next) => {
    return Promise.resolve(callback(req, res, next)).catch(next);
  };

  return newRequestHandler;
};
