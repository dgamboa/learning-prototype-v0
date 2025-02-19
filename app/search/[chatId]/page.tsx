"use server"

import { Suspense } from "react"
import ChatArea from "@/app/search/_components/chat-area"
import ChatAreaSkeleton from "@/app/search/_components/chat-area-skeleton"
import { getMessagesByChatIdAction } from "@/actions/db/messages-actions"
import { getSourcesByChatIdAction } from "@/actions/db/sources-actions"
import { auth } from "@clerk/nextjs/server"

async function ChatAreaFetcher({ chatId, userId }: { chatId: string; userId: string }) {
  const { data: messages } = await getMessagesByChatIdAction(chatId)
  const { data: sources } = await getSourcesByChatIdAction(chatId)

  return (
    <div className="h-full p-4">
      <ChatArea
        chatId={chatId}
        userId={userId}
        initialMessages={messages || []}
        initialSources={sources || []}
      />
    </div>
  )
}

export default async function ChatPage({
  params
}: {
  params: { chatId: string }
}) {
  const resolvedParams = await params
  const chatId = resolvedParams.chatId
  
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  return (
    <Suspense fallback={<ChatAreaSkeleton />}>
      <ChatAreaFetcher chatId={chatId} userId={userId} />
    </Suspense>
  )
} 