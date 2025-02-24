"use client"

import { SelectChat } from "@/db/schema"
import { deleteChatAction } from "@/actions/db/chats-actions"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface SidebarProps {
    initialChats: SelectChat[]
    userId: string
}

export default function Sidebar({ initialChats }: SidebarProps) {
    const [chats, setChats] = useState(initialChats)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        setChats(initialChats)
    }, [initialChats])

    const handleNewSearch = () => {
        router.push("/search")
    }

    const handleDeleteChat = async (chatId: string) => {
        const result = await deleteChatAction(chatId)
        if (result.isSuccess) {
            setChats(chats.filter(chat => chat.id !== chatId))
            
            // If we're currently on the chat that was deleted, redirect to /search
            if (pathname === `/search/${chatId}`) {
                router.push("/search")
            }
        }
    }

    return (
        <div className="w-80 border-r border-muted/10 bg-muted/10 flex flex-col h-full">
            <div className="p-4">
                <Button
                    onClick={handleNewSearch}
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Search
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-lg font-semibold mb-2">Library</h2>
                {chats.map((chat) => (
                    <div 
                        key={chat.id}
                        className={`group mb-2 flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 ${
                            pathname === `/search/${chat.id}` ? "bg-muted/50" : ""
                        }`}
                    >
                        <Link href={`/search/${chat.id}`} className="flex-1">
                            <span className="text-neutral-500">{chat.name}</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteChat(chat.id)}
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
} 