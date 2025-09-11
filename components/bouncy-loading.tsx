"use client"

interface BouncyLoadingProps {
  size?: string
  color?: string
  text?: string
}

export function BouncyLoading({ size = "45", color = "#a78bfa", text = "Loading..." }: BouncyLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="flex space-x-2">
        <div className={`w-3 h-3 bg-[${color}] rounded-full animate-bounce`} style={{ animationDelay: "0s" }}></div>
        <div className={`w-3 h-3 bg-[${color}] rounded-full animate-bounce`} style={{ animationDelay: "0.2s" }}></div>
        <div className={`w-3 h-3 bg-[${color}] rounded-full animate-bounce`} style={{ animationDelay: "0.4s" }}></div>
      </div>
      {text && <p className="mt-4 text-gray-400 text-lg">{text}</p>}
    </div>
  )
}
