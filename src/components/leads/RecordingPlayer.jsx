import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { duration } from '../../lib/format.js'

// Faux audio player — visualizes a call recording without a real media file.
// Shared by the operator lead drawer and the client portal.
export default function RecordingPlayer({ seconds }) {
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const timer = useRef(null)

  useEffect(() => () => clearInterval(timer.current), [])

  const toggle = () => {
    if (playing) {
      clearInterval(timer.current)
      setPlaying(false)
    } else {
      setPlaying(true)
      timer.current = setInterval(() => {
        setT((cur) => {
          if (cur >= seconds) {
            clearInterval(timer.current)
            setPlaying(false)
            return 0
          }
          return cur + 1
        })
      }, 120)
    }
  }

  const pct = Math.min(100, (t / seconds) * 100)
  const bars = Array.from({ length: 48 }, (_, i) => 20 + ((i * 37) % 70))

  return (
    <div className="surface-muted flex items-center gap-3 p-3">
      <button
        onClick={toggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-9 items-center gap-[2px] overflow-hidden">
          {bars.map((h, i) => {
            const active = (i / bars.length) * 100 <= pct
            return (
              <span
                key={i}
                className={`w-[3px] shrink-0 rounded-full transition-colors ${active ? 'bg-accent' : 'bg-white/15'}`}
                style={{ height: `${h}%` }}
              />
            )
          })}
        </div>
      </div>
      <span className="shrink-0 font-mono text-[12px] tabular-nums text-slate-400">
        {duration(t)} / {duration(seconds)}
      </span>
    </div>
  )
}
