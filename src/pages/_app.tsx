import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={geist.className}>
      <ClerkProvider>
        <Head>
          <title>Twitter Emoji Clone</title>
          <meta name="description" content="Twitter Clone App" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Toaster />
        <Component {...pageProps} />
      </ClerkProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
