import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/utilities/providers";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createUser, getUserByUserId } from "@/db/queries/users-queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learning Prototype",
  description: "A learning prototype for a new startup",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth()
  const userAuth = await currentUser()

  if (userId) {
    const user = await getUserByUserId(userId)
    if (!user) {
      await createUser({
        userId,
        email: userAuth?.emailAddresses[0].emailAddress || "",
        username: userAuth?.username || userAuth?.firstName || userId,
      })
    }
    return (
      <ClerkProvider>
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Providers
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </Providers>
          </body>
        </html>
      </ClerkProvider>
    );
  }
}
