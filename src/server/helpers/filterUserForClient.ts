import { type User as ClerkUser } from "@clerk/nextjs/server";

// Define and export the User type that will be returned by filterUserForClient
export type User = {
  id: string;
  username: string | null;
  imageUrl: string;
};

export const filterUserForClient = (user: ClerkUser): User => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};
