"use server"

import { Suspense } from "react"
import ChatArea from "../_components/chat-area"
import ChatAreaSkeleton from "../_components/chat-area-skeleton"
import { getMessagesByChatIdAction } from "@/actions/db/messages-actions"
import { getSourcesByChatIdAction } from "@/actions/db/sources-actions"

export default async function ChatPage({
  params
}: {
  params: { chatId: string }
}) {
  return (
    <Suspense fallback={<ChatAreaSkeleton />}>
      <ChatAreaFetcher chatId={params.chatId} />
    </Suspense>
  )
}

async function ChatAreaFetcher({ chatId }: { chatId: string }) {
  const { data: messages } = await getMessagesByChatIdAction(chatId)
  const { data: sources } = await getSourcesByChatIdAction(chatId)

  return (
    <div className="h-full p-4">
      <ChatArea 
        initialMessages={messages || []} 
        initialSources={sources || []}
        chatId={chatId}
      />
    </div>
  )
} 