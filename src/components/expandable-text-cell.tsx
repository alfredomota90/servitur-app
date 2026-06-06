export default function ExpandableTextCell({
  text,
  color,
  expanded,
  onToggle,
}: {
  text: string
  color: string
  expanded: boolean
  onToggle: () => void
}) {
  const maxLen = 30
  const truncated = text.length > maxLen ? text.slice(0, maxLen) + '...' : text

  if (text.length <= maxLen) return <span style={{ color }}>{text}</span>

  return (
    <div>
      <span style={{ color }}>{expanded ? text : truncated}</span>
      <button onClick={onToggle} className="ml-1 text-xs font-medium" style={{ color: '#c59d5c' }}>
        {expanded ? 'Ver menos' : 'Ver más'}
      </button>
    </div>
  )
}
