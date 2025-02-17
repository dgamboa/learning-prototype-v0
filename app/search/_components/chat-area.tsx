"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SelectSource, SelectMessage } from "@/db/schema"

interface ChatAreaProps {
  className?: string
  initialSources?: SelectSource[]
  initialMessages?: SelectMessage[]
  chatId?: string
  userId?: string
}

export default function ChatArea({ className, initialSources, initialMessages, chatId, userId }: ChatAreaProps) {
  return (
    <div className={`flex h-full flex-col ${className}`}>
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
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 