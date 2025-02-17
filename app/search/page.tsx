"use server"

import ChatArea from "./_components/chat-area"

export default async function SearchPage() {
  return (
    <div className="h-full p-4">
      <ChatArea initialSources={[]} initialMessages={[]} />
    </div>
  )
}
