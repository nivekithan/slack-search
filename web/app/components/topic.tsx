import { Link } from "@remix-run/react";
import { formatRelative } from "date-fns";
import { capitalizeFirstLetter } from "~/common/utils.common";

export type TopicProps = {
  message: string;
  avatarLetter: string;
  username: string;
  createdAt: Date;
  viewReplyLinkTo: string;
};

export const Topic = ({
  message,
  avatarLetter,
  username,
  createdAt,
  viewReplyLinkTo,
}: TopicProps) => {
  const relativeTime = capitalizeFirstLetter(
    formatRelative(createdAt, new Date())
  );

  return (
    <div className="topic_container text-base px-3">
      <div className="__avatar grid place-items-center w-9 h-9 bg-blue-600 text-white rounded-full">
        <span>{avatarLetter}</span>
      </div>
      <h1 className="__username font-semibold">{username}</h1>
      <p className="__time font-light text-sm text-gray-600">{relativeTime}</p>
      <p className="__message">{message}</p>
      <Link
        to={viewReplyLinkTo}
        className="__view_replies text-sm text-blue-600 pt-3 hover:underline"
      >
        View Replies
      </Link>
    </div>
  );
};
