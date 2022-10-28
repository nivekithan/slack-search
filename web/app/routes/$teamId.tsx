import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Channels} from "~/server/api.server";
import { getChannelsForTeam } from "~/server/api.server";

export const loader = async ({ params }: LoaderArgs) => {
  const teamId = params.teamId;
  invariant(teamId, "Team ID is required");

  const channels = await getChannelsForTeam(teamId);

  return json({ channels });
};

const NavigationSideBar = () => {
  const loaderData = useLoaderData<typeof loader>();

  const channels = loaderData.channels;

  return <RenderChannels channels={channels} />;
};

type RenderChannelsProps = {
  channels: Channels;
};
const RenderChannels = ({ channels }: RenderChannelsProps) => {
  if (channels.length === 0) {
    return <p>No channels</p>;
  }

  return (
    <ul>
      {channels.map((channel) => {
        return <li key={channel.id}> {channel.channelName}</li>;
      })}
    </ul>
  );
};

export default NavigationSideBar;
