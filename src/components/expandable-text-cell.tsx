export default function ExpandableTextCell({
  text,
  expanded,
  onToggle,
}: {
  text: string
  expanded: boolean
  onToggle: () => void
}) {
  const maxLen = 30
  const truncated = text.length > maxLen ? text.slice(0, maxLen) + '...' : text

  if (text.length <= maxLen) return <span>{text}</span>

  return (
    <div>
      <span>{expanded ? text : truncated}</span>
      <button onClick={onToggle} className="ml-1 text-xs font-medium text-accent">
        {expanded ? 'Ver menos' : 'Ver más'}
      </button>
    </div>
  )
}
