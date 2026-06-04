// Chat-style render of an AI agent / caller transcript.
// Lines are prefixed "Agent:" / "Caller:" in the source text.
export default function Transcript({ text, maxHeight = 'max-h-72' }) {
  if (!text) return <p className="text-[13px] text-slate-500">No transcript available.</p>
  return (
    <div className={`surface-muted ${maxHeight} space-y-2.5 overflow-y-auto p-4`}>
      {text.split('\n').map((line, i) => {
        const isAgent = line.startsWith('Agent:')
        const [, body] = line.split(/^(Agent:|Caller:)/).slice(1)
        return (
          <div key={i} className={`flex ${isAgent ? '' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-snug ${isAgent ? 'bg-white/[0.04] text-slate-200' : 'bg-accent/10 text-slate-100'}`}>
              <span className={`mb-0.5 block text-[10px] font-semibold uppercase tracking-wide ${isAgent ? 'text-slate-500' : 'text-accent'}`}>
                {isAgent ? 'AI Agent' : 'Caller'}
              </span>
              {body?.trim()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
