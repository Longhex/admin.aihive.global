export function SimpleLoading({ text = "Loading...", color = "border-purple-500" }: { text?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${color}`}></div>
      {text && <p className="mt-4 text-gray-400 text-lg">{text}</p>}
    </div>
  )
}
