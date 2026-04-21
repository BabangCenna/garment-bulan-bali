'use client'

const Stepper = ({
  steps    = [], // [{ label, description }]
  current  = 0,
  variant  = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
}) => {
  const getStatus = (i) => {
    if (i < current)  return 'done'
    if (i === current) return 'active'
    return 'pending'
  }

  return (
    <div className={['stepper', `stepper-${variant}`, className].filter(Boolean).join(' ')}>
      {steps.map((step, i) => {
        const status = getStatus(i)
        return (
          <div key={i} className={`stepper-item stepper-item-${status}`}>
            <div className="stepper-indicator">
              <div className="stepper-dot">
                {status === 'done'
                  ? <i className="fa-solid fa-check" />
                  : <span>{i + 1}</span>
                }
              </div>
              {i < steps.length - 1 && <div className="stepper-line" />}
            </div>
            <div className="stepper-label">
              <div className="stepper-step-label">{step.label}</div>
              {step.description && (
                <div className="stepper-step-desc">{step.description}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Stepper