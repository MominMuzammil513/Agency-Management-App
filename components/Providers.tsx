"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { SocketProvider } from "@/lib/socket-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
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
      </SocketProvider>
    </SessionProvider>
  );
}
