"use client"

import { SearchInput } from "@/app/search/_components/search-input"
import { BookOpenCheck, Loader2 } from "lucide-react"
import { SelectSource, SelectMessage } from "@/db/schema"
import { useState, KeyboardEvent, useRef, useEffect } from "react"
import { searchExaAction } from "@/actions/exa-actions"
import { generateOpenAIResponseAction } from "@/actions/openai-actions"
import { readStreamableValue } from "ai/rsc"
import { createChatAction } from "@/actions/db/chats-actions"
import { createMessageAction } from "@/actions/db/messages-actions"
import { createSourcesAction } from "@/actions/db/sources-actions"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import Markdown from "react-markdown"

interface ChatAreaProps {
  className?: string
  initialSources?: SelectSource[]
  initialMessages?: SelectMessage[]
  userId: string
  chatId: string
}

export default function ChatArea({
  className,
  initialSources,
  initialMessages,
  userId,
  chatId
}: ChatAreaProps) {
  const [messages, setMessages] = useState<SelectMessage[]>(initialMessages || [])
  const [sources, setSources] = useState<SelectSource[]>(initialSources || [])
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const isNewSearch = searchParams.get("new") === "true"
    if (isNewSearch) {
      setMessages([])
      setSources([])
      router.replace("/search", undefined)
    }
  }, [searchParams, router])

  const handleSearch = async (query: string) => {
    setIsSearching(true)

    let isNewChat = true

    const userMessageId = Date.now().toString()
    const assistantMessageId = Date.now().toString() + 1

    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: query,
        chatId: chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "Searching for information...",
        chatId: chatId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

    const exaResponse = await searchExaAction(query)

    if (!exaResponse.isSuccess || !exaResponse.data) {
      console.error("Error searching Exa:", exaResponse.message)
      setIsSearching(false)
      return
    }

    console.log("exaResponse", exaResponse.data)

    setSources(
      (exaResponse.data.results || []).map((result, i) => ({
        id: `${Date.now()}-${i}`,
        chatId: chatId,
        url: result.url,
        title: result.title,
        text: result.text,
        summary: result.summary,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    setIsSearching(false)
    setIsGenerating(true)

    const openaiResponse = await generateOpenAIResponseAction(query, sources)
    if (!openaiResponse.isSuccess || !openaiResponse.data) {
      console.error("Error generating OpenAI response:", openaiResponse.message)
      setIsGenerating(false)
      return
    }

    setIsGenerating(false)

    let fullContent = ""
    try {
      for await (const chunk of readStreamableValue(openaiResponse.data)) {
        if (chunk) {
          fullContent += chunk
          setMessages(prev =>
            prev.map(message =>
              message.id === assistantMessageId
                ? { ...message, content: fullContent }
                : message
            )
          )
        }
      }
    } catch (error) {
      console.error("Error generating full response:", error)
    }

    if (isNewChat) {
      const newChat = await createChatAction({
        userId,
        name: query.slice(0, 50)
      })
      if (newChat.isSuccess && newChat.data) {
        chatId = newChat.data.id
        isNewChat = false
      } else {
        console.error("Error creating chat:", newChat.message)
        return
      }
    }

    const userMessageResult = await createMessageAction({
      chatId: chatId,
      content: query,
      role: "user",
    })

    const assistantMessageResult = await createMessageAction({
      chatId: chatId,
      content: fullContent,
      role: "assistant",
    })

    const sourcesResult = await createSourcesAction(exaResponse.data?.results.map(result => ({
      ...result,
      chatId: chatId,
    })) || [])

    if (!sourcesResult.isSuccess) {
      console.error("Failed to save sources:", sourcesResult.message)
    }

    if (!assistantMessageResult.isSuccess || !assistantMessageResult.data) {
      console.error(
        "Failed to create assistant message:",
        assistantMessageResult.message
      )
    }

    if (isNewChat) {
      window.history.pushState(null, "", `/search/${chatId}`)
    }
  }


  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleSearch(inputValue.trim())
      setInputValue("")
    }
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {messages.length === 0 ? (
        <div className="flex-1">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="text-lg font-medium text-muted-foreground">
              <h1 className="text-4xl font-bold text-center mb-4 text-white">Ask anything</h1>
            </div>
            <div className="w-full max-w-xl px-4">
              <div className="relative">
                <SearchInput
                  ref={searchInputRef}
                  onSearch={handleSearch}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
          {[...messages].reverse().map(message => (
            <div key={message.id}>
              {message.role === "user" && (
                <div className="text-2xl font-black text-left font-extrabold">
                  {message.content}
                </div>
              )}

              {message.role === "user" && (
                <div className="overflow-x-auto pb-2">
                  <div className="max-content mb-4 flex gap-4">
                    {sources.map(source => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col justify-between w-[160px] h-[160px] p-4 border rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                      >
                        <div className="font-medium line-clamp-3">{source.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{source.url}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {message.role === "assistant" && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpenCheck className="size-5" />
                    <div className="text-xl font-bold">Answer</div>
                  </div>
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Searching for information...</span>
                    </div>
                  ) : isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  ) : (
                    <>
                      <Markdown>{message.content}</Markdown>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 