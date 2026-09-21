export default function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${compact ? 'h-10 w-10 rounded-xl' : 'h-11 w-11 rounded-2xl'} flex items-center justify-center bg-[#22C55E] shadow-[0_0_24px_rgba(34,197,94,0.35)]`}>
        <svg className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} text-black`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight">UpLife</span>
    </div>
  )
}
