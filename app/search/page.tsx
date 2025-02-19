"use server"

import { Suspense } from "react"
import { redirect } from "next/navigation"
import ChatArea from "./_components/chat-area"
import ChatAreaSkeleton from "./_components/chat-area-skeleton"
import { auth } from "@clerk/nextjs/server"

export default async function SearchPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect("/login")
  }

  return (
    <Suspense fallback={<ChatAreaSkeleton />}>
      <div className="h-full p-4">
        <ChatArea 
          initialSources={[]} 
          initialMessages={[]} 
          userId={userId} 
          chatId={""} 
        />
      </div>
    </Suspense>
  )
}
