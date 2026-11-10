import { useId, useRef } from 'react'
import { Button } from './Button'

export function HomeButton({ onClick, confirmLeave = false }: { onClick: () => void; confirmLeave?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()

  function requestHome() {
    if (confirmLeave) dialog.current?.showModal()
    else onClick()
  }

  return (
    <>
      <button type="button" className="home-button" onClick={requestHome} aria-haspopup={confirmLeave ? 'dialog' : undefined}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
          <path d="m3 10 9-7 9 7v10h-6v-7H9v7H3z" />
        </svg>
        Home
      </button>
      {confirmLeave && (
        <dialog
          ref={dialog}
          aria-labelledby={id}
          aria-describedby={id + '-description'}
          className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-hairline bg-surface p-6 text-bone backdrop:bg-void"
        >
          <h2 id={id} className="text-title font-bold">Leave this game?</h2>
          <p id={id + '-description'} className="mt-2 text-mist">Leaving ends this game for everyone. Your names and settings will be kept.</p>
          <div className="mt-6 grid gap-3">
            <Button onClick={() => dialog.current?.close()}>Keep playing</Button>
            <Button variant="secondary" onClick={onClick}>Leave game</Button>
          </div>
        </dialog>
      )}
    </>
  )
}
