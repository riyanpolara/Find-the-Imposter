export function HomeButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="home-button" onClick={onClick}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
        <path d="m3 10 9-7 9 7v10h-6v-7H9v7H3z" />
      </svg>
      Home
    </button>
  )
}
