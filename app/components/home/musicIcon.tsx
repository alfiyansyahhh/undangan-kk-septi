export default function MusicIcon({ playing }: { playing: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 18V5l11-2v13M9 9l11-2" />
    <ellipse cx="6" cy="18" rx="3" ry="2" /><ellipse cx="17" cy="16" rx="3" ry="2" />
    {!playing && <path d="m3 3 18 18" />}
  </svg>;
}
