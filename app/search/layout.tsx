"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import Sidebar from "./_components/sidebar"
import SidebarSkeleton from "./_components/sidebar-skeleton"
import { getChatsByUserIdAction } from "@/actions/db/chats-actions"
import { redirect } from "next/navigation"
import { getUserByUserIdAction } from "@/actions/db/users-actions"

export default async function SearchLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    return redirect("/login")
  }

  const user = await getUserByUserIdAction(userId)

  if (!user) {
    return redirect("/signup")
  }

  if (user.data?.membership === "free") {
    return redirect("/pricing")
  }
  
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarFetcher userId={userId} />
      </Suspense>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

async function SidebarFetcher({userId}: {userId: string}) {

  const { data: chats } = await getChatsByUserIdAction(userId)

  return <Sidebar userId={userId} initialChats={chats || []} />
} 