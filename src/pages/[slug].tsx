import Head from "next/head";
import { api } from "~/utils/api";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { db } from "~/server/db";
import PageLayout from "~/components/PageLayout";
import Image from "next/image";
import LoadingSpinner from "~/components/loading";
import PostView from "~/components/postView";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading)
    return (
      <div className="flex w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (!data) return <div>No posts</div>;
  return (
    <div className="flex w-full flex-col">
      {data.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
};

export default function ProfilePage({ slug }: PageProps) {
  const { data: user } = api.profile.getUserByUsername.useQuery({
    username: slug.replace("@", ""),
  });

  if (!user) return <div>User not found</div>;

  // Add type safety for user data
  const userData = user[0];
  const profileImageUrl = userData?.imageUrl ?? "";
  const username = userData?.username ?? "";
  const userId = userData?.id ?? "";

  return (
    <>
      <Head>
        <title>Profile</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative h-48 w-full border-b border-slate-400 text-white">
          <Image
            src={profileImageUrl}
            alt="profile image"
            className="absolute bottom-0 left-0 -mb-20 ml-4 h-42 w-42 rounded-full"
            width={220}
            height={220}
          />
          <div className="h-72"></div>
          <h1 className="pl-10 text-lg">
            {"@"}
            {username}
          </h1>
          <div className="h-10 border-b border-slate-400" />
        </div>
        <div className="h-32"></div>
        <ProfileFeed userId={userId} />
      </PageLayout>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUser: null },
    transformer: superjson,
  });

  const slug = context.params?.slug as string;

  const username = slug.replace("@", "");

  if (typeof slug !== "string") throw new Error("Slug is not a string");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
