export default function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center justify-center">
      <img 
        src="/logo.png" 
        alt="UpLife Logo" 
        className={`${compact ? 'h-12 w-12' : 'h-20 w-20'} object-contain`}
      />
    </div>
  )
}
