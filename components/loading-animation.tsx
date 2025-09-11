"use client"

interface LoadingAnimationProps {
  size?: string
  color?: string
  text?: string
}

export function LoadingAnimation({ size = "37", color = "#4f46e5", text = "Loading..." }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      {text && <p className="mt-4 text-gray-700 text-lg">{text}</p>}
    </div>
  )
}
