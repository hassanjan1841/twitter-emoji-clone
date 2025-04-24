import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { db } from "~/server/db";

export const generateSSGHelper = createServerSideHelpers({
  router: appRouter,
  ctx: {
    db,
    currentUser: null, // Set to null for SSG since we don't have a user in the context
  },
  transformer: superjson,
});
