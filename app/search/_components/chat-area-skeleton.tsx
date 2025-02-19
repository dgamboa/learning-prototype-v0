"use client"

export default function ChatAreaSkeleton() {
  return (
    <div className="h-full p-4 space-y-4 animate-pulse">
      <div className="w-full h-[60vh] rounded-lg border border-muted/20" />
      <div className="w-full h-24 rounded-lg border border-muted/20" />
    </div>
  )
} 