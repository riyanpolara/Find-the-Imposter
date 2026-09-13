import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem } from '@/utils/motion'

export function IntroVideo({ direction }: { direction: number }) {
  const { dispatch } = useGame()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  const handleFinish = () => {
    dispatch({ type: 'COMPLETE_INTRO' })
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <Screen
      direction={direction}
      header={
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-2"
        >
          <div className="text-label text-smoke flex items-center gap-2 uppercase">
            <span className="bg-signal size-1.5 rounded-full animate-pulse" />
            Intro
          </div>
          <button
            type="button"
            onClick={toggleMute}
            className="bg-surface-2 text-bone border-white/10 hover:bg-surface-3 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[0.75rem] font-medium tracking-wider uppercase transition-colors cursor-pointer"
          >
            {isMuted ? (
              <>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                Unmute Sound
              </>
            ) : (
              <>
                <svg className="size-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Sound On
              </>
            )}
          </button>
        </m.div>
      }
      action={
        <m.div
          variants={riseGroup}
          initial="initial"
          animate="animate"
          transition={{ delayChildren: 0.2 }}
          className="space-y-4"
        >
          <m.div variants={riseItem}>
            <Button onClick={handleFinish}>
              Start game &rarr;
            </Button>
          </m.div>
        </m.div>
      }
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Video Player Container */}
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-surface-1 border-white/10 relative aspect-video w-full overflow-hidden rounded-3xl border shadow-2xl"
        >
          <video
            ref={videoRef}
            src="/video.mp4"
            autoPlay
            playsInline
            muted={isMuted}
            onEnded={handleFinish}
            onClick={togglePlay}
            className="h-full w-full object-cover cursor-pointer"
          />

          {/* Overlay Controls */}
          <div className="bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex justify-end">
              {!isPlaying && (
                <span className="bg-black/60 text-bone rounded-lg px-2.5 py-1 text-xs backdrop-blur-md">
                  Paused
                </span>
              )}
            </div>

            {/* Bottom progress bar inside video frame */}
            <div className="w-full space-y-2">
              <div className="bg-white/20 h-1.5 w-full overflow-hidden rounded-full backdrop-blur-sm">
                <div
                  className="bg-bone h-full transition-all duration-150 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </Screen>
  )
}
