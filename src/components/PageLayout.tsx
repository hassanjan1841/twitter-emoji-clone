import type { PropsWithChildren } from "react";

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-black/100">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-start gap-12 border border-white">
        {children}
      </div>
    </main>
  );
}
