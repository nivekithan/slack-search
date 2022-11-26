import type { LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import routeStyles from "~/styles/routes/$teamId/$channelId.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: routeStyles }];
};
export default function AllTopicsOrTopicWithRepliesPage() {
  return <Outlet />;
}
