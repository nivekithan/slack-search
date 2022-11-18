import { getEnvVar } from "./utils.server";

export const BACKEND_API_URL = `${getEnvVar("BACKEND_API_URL")}/api/v1`;
