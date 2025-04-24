import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  console.log("post in view", post);
  return (
    <div
      key={post?.id}
      className="flex w-full items-center justify-start gap-5 border-b border-slate-300 p-5 text-white"
    >
      <Image
        src={author.imageUrl}
        alt="profile image"
        className="h-10 w-10 rounded-full"
        width={40}
        height={40}
      />
      <div className="flex flex-col">
        <span>
          <Link href={`/@${author.username}`}>
            {"@"}
            {author.username}
          </Link>

          <Link href={`/posts/${post?.id}`}>
            <span className="font-thin">
              {" . "}
              {dayjs(post?.createdAt).fromNow()}
            </span>
          </Link>
        </span>
        <Link href={`/posts/${post?.id}`}>{post?.content}</Link>
      </div>
    </div>
  );
};

export default PostView;
