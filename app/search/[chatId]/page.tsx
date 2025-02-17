"use server"

import { Suspense } from "react"
import ChatArea from "../_components/chat-area"
import ChatAreaSkeleton from "../_components/chat-area-skeleton"
import { getMessagesByChatIdAction } from "@/actions/db/messages-actions"
import { getSourcesByChatIdAction } from "@/actions/db/sources-actions"
import { auth } from "@clerk/nextjs/server"

export default async function ChatPage({
  params
}: {
  params: { chatId: string }
}) {
  const { userId } = await auth()
  const {chatId} = await params

  if (!userId) {
    return <div>Please log in to view this page.</div>
  }

  return (
    <div className="h-screen flex-1">
      <Suspense fallback={<ChatAreaSkeleton />}>
        <ChatAreaFetcher userId={userId} chatId={chatId} />
      </Suspense>
    </div>
  )
}


async function ChatAreaFetcher({ chatId, userId }: { chatId: string, userId: string }) {
  const { data: messages } = await getMessagesByChatIdAction(chatId)
  const { data: sources } = await getSourcesByChatIdAction(chatId)

  return (
    <div className="h-full p-4">
      <ChatArea 
        initialMessages={messages || []} 
        initialSources={sources || []}
        chatId={chatId}
        userId={userId}
      />
    </div>
  )
} 