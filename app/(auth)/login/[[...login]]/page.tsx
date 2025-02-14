"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const { theme } = useTheme();

//   TODO: Update the redirect route
  return (
    <SignIn
      forceRedirectUrl="/placeholder"
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
    />
  );
}