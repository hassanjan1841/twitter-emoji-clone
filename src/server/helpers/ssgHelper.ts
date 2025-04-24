import { createServerSideHelpers } from "@trpc/react-query/server";
import { type AppRouter, appRouter } from "~/server/api/root";
import superjson from "superjson";
import { db } from "~/server/db";

/**
 * Server-side helper for tRPC to use in getStaticProps/getServerSideProps
 */
export const generateSSGHelper = createServerSideHelpers<AppRouter>({
  router: appRouter,
  ctx: {
    db,
    currentUser: null, // Set to null for SSG since we don't have a user in the context
  },
  transformer: superjson,
});
