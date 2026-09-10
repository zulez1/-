"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { CityProvider } from "@/lib/city-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CityProvider>{children}</CityProvider>
    </AuthProvider>
  );
}
