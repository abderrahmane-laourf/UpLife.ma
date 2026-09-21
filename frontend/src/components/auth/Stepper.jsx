import { Children, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import './Stepper.css'

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  onBeforeNext = async () => true,
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  completeButtonText = 'Complete',
}) {
  const steps = Children.toArray(children)
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [direction, setDirection] = useState(0)
  const [busy, setBusy] = useState(false)
  const totalSteps = steps.length
  const isLastStep = currentStep === totalSteps

  async function handleNext() {
    if (busy) return
    setBusy(true)
    try {
      const canContinue = await onBeforeNext(currentStep)
      if (!canContinue) return
      setDirection(1)
      if (isLastStep) {
        onFinalStepCompleted()
        return
      }
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      onStepChange(nextStep)
    } finally {
      setBusy(false)
    }
  }

  function handleBack() {
    if (currentStep === 1 || busy) return
    setDirection(-1)
    const previousStep = currentStep - 1
    setCurrentStep(previousStep)
    onStepChange(previousStep)
  }

  function goToStep(step) {
    if (busy || step >= currentStep) return
    setDirection(-1)
    setCurrentStep(step)
    onStepChange(step)
  }

  return (
    <div className="stepper" aria-label="Registration steps">
      <div className="stepper-indicators">
        {steps.map((_, index) => {
          const step = index + 1
          const complete = step < currentStep
          const active = step === currentStep
          return (
            <div className="stepper-indicator-group" key={step}>
              <button
                type="button"
                className={`stepper-indicator ${active ? 'active' : ''} ${complete ? 'complete' : ''}`}
                onClick={() => goToStep(step)}
                aria-current={active ? 'step' : undefined}
                aria-label={`Step ${step}`}
              >
                {complete ? '✓' : step}
              </button>
              {step < totalSteps && <span className={`stepper-connector ${step < currentStep ? 'complete' : ''}`} />}
            </div>
          )
        })}
      </div>

      <AnimatedStep step={currentStep} direction={direction}>
        {steps[currentStep - 1]}
      </AnimatedStep>

      <div className="stepper-footer">
        {currentStep > 1 ? <button type="button" className="stepper-back" onClick={handleBack}>{backButtonText}</button> : <span />}
        <button type="button" className="stepper-next" onClick={handleNext} disabled={busy}>
          {busy ? '...' : isLastStep ? completeButtonText : nextButtonText}
        </button>
      </div>
    </div>
  )
}

function AnimatedStep({ step, direction, children }) {
  return (
    <div className="stepper-content">
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <Slide key={step} direction={direction}>{children}</Slide>
      </AnimatePresence>
    </div>
  )
}

function Slide({ direction, children }) {
  const ref = useRef(null)

  return (
    <motion.div
      ref={ref}
      className="stepper-slide"
      custom={direction}
      variants={{
        enter: (value) => ({ x: value >= 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: '0%', opacity: 1 },
        exit: (value) => ({ x: value >= 0 ? '-30%' : '30%', opacity: 0 }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export function Step({ children }) {
  return <div>{children}</div>
}
