import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

// Use the type from Prisma inferring from the Post model
type Post = NonNullable<Awaited<ReturnType<PrismaClient["post"]["findFirst"]>>>;

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

const addUserDataToPosts = async (posts: Post[]) => {
  const usersList = (await clerkClient()).users
    .getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
    .then((users) => users.data.map(filterUserForClient));

  const users = await usersList;
  console.log(users);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for post not found. Post ID: ${post.id}, Author ID: ${post.authorId}`,
      });
    }
    return {
      post,
      author,
    };
  });
};

export const postRouter = createTRPCRouter({
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Post with id ${input.id} not found`,
        });
      }

      return (await addUserDataToPosts([post]))[0];
    }),

  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          authorId: input.userId,
        },
        take: 100,
        orderBy: { createdAt: "desc" },
      });

      return addUserDataToPosts(posts);
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    return addUserDataToPosts(posts);
  }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return post ?? null;
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;
      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
});
