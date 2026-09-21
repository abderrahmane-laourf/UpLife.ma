export default function TopLoader({ visible }) {
  if (!visible) return null

  return (
    <div className="top-loader" role="progressbar" aria-label="Loading">
      <span />
    </div>
  )
}
