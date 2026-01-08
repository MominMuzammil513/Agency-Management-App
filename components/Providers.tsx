"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <SessionProvider>
        {children}
        <Toaster
          position="top-center"
          richColors={false}
          duration={10000}
          className="sonner-toast"
          toastOptions={{
            unstyled: true,
          }}
        />
      </SessionProvider>
  );
}
