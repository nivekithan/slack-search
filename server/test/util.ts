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
