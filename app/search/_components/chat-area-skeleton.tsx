"use client"

export default function ChatAreaSkeleton() {
  return (
    <div className="h-full p-4 space-y-4 animate-pulse">
      <div className="w-full h-[60vh] bg-muted rounded-lg" />
      <div className="w-full h-24 bg-muted rounded-lg" />
    </div>
  )
} 