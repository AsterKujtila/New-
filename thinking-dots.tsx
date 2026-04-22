export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl glass max-w-[80px]">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          style={{ animation: `dotb .72s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
  )
}
