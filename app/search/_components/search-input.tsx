"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { ForwardedRef, forwardRef, useState } from "react"

interface SearchInputProps {
  onSearch: (query: string) => void
  className?: string
}

export const SearchInput = forwardRef(function SearchInput(
  { onSearch, className }: SearchInputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const [query, setQuery] = useState("")

  const handleSearch = async () => {
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center border rounded-md focus-within:ring-1 focus-within:ring-white/20 focus-within:ring-offset-0">
        <Input
          ref={ref}
          className="pr-12 bg-background/5 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          type="text"
          placeholder="Search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSearch()}
        />

        <Button
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-zinc-800 hover:bg-zinc-700"
          variant="ghost"
          size="icon"
          onClick={handleSearch}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
})