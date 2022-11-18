import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getChannels } from "~/server/channels.server";

export const loader = async ({ params }: LoaderArgs) => {
  const teamId = params.teamId;
  invariant(
    teamId,
    "Could not find teamId from loaderArgs.params. Make sure the filename is $teamId"
  );
  const channels = await getChannels(teamId);

  if (channels instanceof Error) {
    throw new Response("not found", { status: 404 });
  }

  return json({ teamId, channels });
};

const TeamHomePage = () => {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="pb-14">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-blue-500 h-14 grid place-items-center px-3 py-2">
        <select className="w-full rounded-md ">
          {loaderData.channels.map((channel) => {
            return (
              <option
                value={channel.channelId}
                key={channel.id}
                className="text-base"
              >
                {channel.channelName}
              </option>
            );
          })}
        </select>
      </nav>
    </div>
  );
};

export default TeamHomePage;
