// components/ui/form/StepperForm.jsx
'use client'
import { useState } from 'react'
import Button from '@/components/ui/button/Button'

const StepperForm = ({
  steps       = [], // [{ title, description, icon, content, validate }]
  onFinish,         // async () => void
  finishLabel = 'Selesai',
  className   = '',
}) => {
  const [current,  setCurrent]  = useState(0)
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  const isFirst = current === 0
  const isLast  = current === steps.length - 1

  const getStatus = (i) => {
    if (i < current)  return 'done'
    if (i === current) return 'active'
    return 'pending'
  }

  const handleNext = async () => {
    const step = steps[current]
    if (step.validate) {
      const errs = await step.validate()
      if (errs && Object.keys(errs).length > 0) {
        setErrors(errs)
        return
      }
    }
    setErrors({})
    if (isLast) {
      setLoading(true)
      try {
        await onFinish?.()
        setDone(true)
      } finally {
        setLoading(false)
      }
    } else {
      setCurrent(v => v + 1)
    }
  }

  const handleBack = () => {
    setErrors({})
    setCurrent(v => v - 1)
  }

  const handleStep = (i) => {
    if (i < current) { setErrors({}); setCurrent(i) }
  }

  if (done) {
    return (
      <div className="stepper-form-done">
        <div className="stepper-form-done-icon">
          <i className="fa-solid fa-circle-check" />
        </div>
        <div className="stepper-form-done-title">Berhasil!</div>
        <div className="stepper-form-done-desc">Semua langkah telah selesai.</div>
      </div>
    )
  }

  return (
    <div className={['stepper-form', className].filter(Boolean).join(' ')}>

      {/* step indicators */}
      <div className="stepper-form-nav">
        {steps.map((step, i) => {
          const status = getStatus(i)
          return (
            <div
              key={i}
              className={`stepper-form-step stepper-form-step-${status}`}
              onClick={() => handleStep(i)}
              style={{ cursor: i < current ? 'pointer' : 'default' }}
            >
              <div className="stepper-form-dot">
                {status === 'done'
                  ? <i className="fa-solid fa-check" />
                  : step.icon
                  ? step.icon
                  : <span>{i + 1}</span>
                }
              </div>
              <div className="stepper-form-step-text">
                <div className="stepper-form-step-title">{step.title}</div>
                {step.description && (
                  <div className="stepper-form-step-desc">{step.description}</div>
                )}
              </div>
              {i < steps.length - 1 && <div className="stepper-form-connector" />}
            </div>
          )
        })}
      </div>

      {/* content */}
      <div className="stepper-form-content">
        <div className="stepper-form-content-header">
          <div className="stepper-form-content-title">{steps[current]?.title}</div>
          <div className="stepper-form-content-step">
            Langkah {current + 1} dari {steps.length}
          </div>
        </div>
        <div className="stepper-form-body">
          {steps[current]?.content({ errors, setErrors })}
        </div>
      </div>

      {/* footer */}
      <div className="stepper-form-footer">
        <Button
          variant="secondary"
          disabled={isFirst}
          onClick={handleBack}
          leftIcon={<i className="fa-solid fa-arrow-left" />}
        >
          Kembali
        </Button>
        <div className="stepper-form-dots">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`stepper-form-dot-indicator ${i === current ? 'active' : ''}`}
            />
          ))}
        </div>
        <Button
          variant="primary"
          loading={loading}
          onClick={handleNext}
          rightIcon={!isLast && !loading ? <i className="fa-solid fa-arrow-right" /> : undefined}
          leftIcon={isLast && !loading ? <i className="fa-solid fa-check" /> : undefined}
        >
          {isLast ? finishLabel : 'Lanjut'}
        </Button>
      </div>

    </div>
  )
}

export default StepperForm