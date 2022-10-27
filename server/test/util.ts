import { RestRequest } from "msw";

export const convertCreatedAtAndUpdateAtDateToString = <
  Arg extends { createdAt: Date; updatedAt: Date }
>(
  arg: Arg
): Arg => {
  return {
    ...arg,
    createdAt: arg.createdAt.toISOString(),
    updatedAt: arg.updatedAt.toISOString(),
  };
};

export const teamIdIs = <Arg extends { teamId: string }>(teamId: string) => {
  return (arg: Arg) => arg.teamId === teamId;
};

export const sortCreatedAtDesc = <Arg extends { createdAt: Date }>(
  a: Arg,
  b: Arg
) => {
  return b.createdAt.getTime() - a.createdAt.getTime();
};

export const getAuthorizationToken = (req: RestRequest) => {
  const authorizationHeader = req.headers.get("authorization");
  if (authorizationHeader === null) {
    return null;
  }

  const authorizationToken = authorizationHeader.split(" ")[1];

  if (!authorizationToken) {
    return null;
  }

  return authorizationToken;
};

export const parseFormUrlEncoded = (bodyText: string) => {
  const rows = bodyText.split(/\n/);

  const resultantObj = rows.reduce(
    (acc: Map<string, string>, cur: string) => {
      const [key, value] = cur.split("=");
      acc.set(key, value);
      return acc;
    },
    new Map()
  );

  return resultantObj;
};
