import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/utilities/providers";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createUserAction, getUserByUserIdAction } from "@/actions/users-actions";
import Header from "@/components/header";

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

  // TODO: review this logic to make sure it makes sense
  if (userId) {
    const user = await getUserByUserIdAction(userId)
    if (!user.data) {
      await createUserAction({
        userId,
        email: userAuth?.emailAddresses[0].emailAddress || "",
        username: userAuth?.username || userAuth?.firstName || userId,
      })
    }
  }
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}