"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SelectSource, SelectMessage } from "@/db/schema"
import { useState, KeyboardEvent } from "react"
import { searchExaAction } from "@/actions/exa-actions"
import { generateOpenAIResponseAction } from "@/actions/openai-actions"
import { readStreamableValue } from "ai/rsc"

interface ChatAreaProps {
  className?: string
  initialSources?: SelectSource[]
  initialMessages?: SelectMessage[]
  userId?: string
}

export default function ChatArea({
  className,
  initialSources,
  initialMessages,
  userId
}: ChatAreaProps) {
  const [messages, setMessages] = useState<SelectMessage[]>(initialMessages || [])
  const [sources, setSources] = useState<SelectSource[]>(initialSources || [])
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleSearch = async (query: string) => {
    setIsSearching(true)
    
    let currentChatId = "temp-chat-id"
    let isNewChat = true

    const userMessageId = Date.now().toString()
    const assistantMessageId = Date.now().toString() + 1

    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: query,
        chatId: currentChatId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "Searching for information...",
        chatId: currentChatId,
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
        chatId: currentChatId,
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
            <div className="w-full max-w-md px-4">
              <div className="relative">
                <Input
                  placeholder="Search..."
                  className="pr-10"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
          {/* User Query */}
          <div className="text-2xl font-black text-left font-extrabold">
            {messages[0]?.content}
          </div>

          {/* Sources Grid */}
          <div className="flex gap-4 justify-center">
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

          {/* Assistant Response */}
          <div className="prose prose-invert max-w-none text-left">
            {messages[1]?.content}
          </div>
        </div>
      )}
    </div>
  )
} 