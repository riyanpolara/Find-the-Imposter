import { m, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { AgentMark } from '@/components/ui/AgentMark'
import { useGame } from '@/hooks/useGame'

export function IntroVideo({ direction }: { direction: number }) {
  const { dispatch } = useGame()
  const reduceMotion = useReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const finishing = useRef(false)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState(0)

  const finish = () => {
    if (finishing.current) return
    finishing.current = true
    video.current?.pause()
    dispatch({ type: 'COMPLETE_INTRO' })
  }

  const togglePlay = async () => {
    if (!video.current) return
    if (!video.current.paused) video.current.pause()
    else {
      try { await video.current.play() } catch { setPlaying(false) }
    }
  }

  return (
    <m.main
      className="cinema"
      aria-label="Mr. White intro video"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -direction * 12 }}
      transition={{ duration: reduceMotion ? 0 : 0.4 }}
    >
      <m.video
        className="cinema-video"
        ref={video}
        src="/video.mp4"
        aria-label="Mr. White cinematic intro"
        autoPlay={!reduceMotion}
        playsInline
        muted={muted}
        preload="auto"
        initial={{ scale: reduceMotion ? 1 : 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        onCanPlay={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={finish}
        onError={() => { setFailed(true); setPlaying(false) }}
        onTimeUpdate={() => {
          const el = video.current
          if (el && Number.isFinite(el.duration) && el.duration > 0) {
            setProgress(el.currentTime / el.duration * 100)
          }
        }}
      />
      <div className="cinema-shade" aria-hidden="true" />
      <m.header className="cinema-top" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <span className="cinema-brand"><AgentMark /> MR. WHITE</span>
        <button className="cinema-control" onClick={finish}>Skip intro <span aria-hidden="true">↗</span></button>
      </m.header>

      {!playing && (ready || failed) && (
        <div className="cinema-center">
          {failed ? (
            <p role="status">The intro couldn’t load.<br />Your game is ready below.</p>
          ) : (
            <m.button className="cinema-play" aria-label="Play intro" onClick={() => void togglePlay()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.92 }}>
              <span aria-hidden="true">▶</span>
            </m.button>
          )}
        </div>
      )}

      <m.div className="cinema-bottom" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
        <p className="cinema-kicker">GOOD FRIENDS. GREAT LIARS.</p>
        <h1>TRUST NOBODY.</h1>
        <div className="cinema-toolbar">
          <button className="cinema-control" onClick={() => void togglePlay()} disabled={failed} aria-label={playing ? 'Pause intro' : 'Play intro video'}>
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span> {playing ? 'Pause' : 'Play'}
          </button>
          <button className="cinema-control" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Mute sound'}>
            <span className={playing && !muted ? 'sound-bars active' : 'sound-bars'} aria-hidden="true"><i /><i /><i /><i /></span>
            {muted ? 'Sound off' : 'Sound on'}
          </button>
        </div>
        <div className="cinema-progress" aria-label="Intro progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <div style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <button className="cinema-enter" onClick={finish}>Enter the game <span aria-hidden="true">↗</span></button>
        {!ready && !failed && <p className="cinema-loading" role="status">Loading the intro…</p>}
      </m.div>
    </m.main>
  )
}
