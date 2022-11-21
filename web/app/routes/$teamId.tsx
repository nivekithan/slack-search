import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { getChannels } from "~/server/channels.server";
import type { ChangeEvent } from "react";

export const loader = async ({  params }: LoaderArgs) => {
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

const SELECT_NEW_CHANNEL_ID = "select-new-channel";

const TeamHomePage = () => {
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const params = useParams();

  const activeChannelId = params.channelId;
  const selectDefaultValue = activeChannelId || SELECT_NEW_CHANNEL_ID;

  const handleChannelChangeEvent = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const newChannelId = e.currentTarget.value;

    if (newChannelId === SELECT_NEW_CHANNEL_ID) {
      navigate(`/${loaderData.teamId}`);
      return;
    }

    navigate(`/${loaderData.teamId}/${newChannelId}`);
  };

  return (
    <div className="pb-24">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-blue-500 max-h-24 flex flex-col gap-y-2 px-3 py-2">
        <label htmlFor="channel-select" className="text-white">Select Channel</label>
        <select
          className="w-full rounded-md"
          onChange={handleChannelChangeEvent}
          defaultValue={selectDefaultValue}
          id="channel-select"
        >
          <option
            value={SELECT_NEW_CHANNEL_ID}
            className="text-base"
            hidden
            disabled
          >
            Select New Channel
          </option>
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
