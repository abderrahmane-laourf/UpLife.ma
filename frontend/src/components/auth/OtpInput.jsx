import { useRef } from 'react'

export default function OtpInput({ value, onChange, disabled = false }) {
  const inputRefs = useRef([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || '')

  function updateDigit(index, nextValue) {
    const digit = nextValue.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = digit
    onChange(nextDigits.join(''))
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handlePaste(event) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="otp-input-row mt-4 flex w-full justify-between gap-2" role="group" aria-label="6 digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { inputRefs.current[index] = element }}
          value={digit}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          aria-label={`Verification digit ${index + 1}`}
          className="otp-digit h-14 w-11 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-white outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-2 focus:ring-[#22C55E]/30 disabled:opacity-60 sm:w-12"
        />
      ))}
    </div>
  )
}
