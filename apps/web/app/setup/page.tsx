'use client'
import { useSetup, STEPS } from '@/hooks/use-setup'
import { ProgressBar } from '@/components/setup/ProgressBar'
import { QuestionCard } from '@/components/setup/QuestionCard'
import type { SetupAnswers } from '@/store/setup.store'

export default function SetupPage() {
  const {
    currentStep,
    totalSteps,
    isSummary,
    step,
    answers,
    submitted,
    setAnswer,
    goNext,
    goBack,
    submit,
  } = useSetup()

  function handleTextChange(key: keyof SetupAnswers, value: string) {
    setAnswer(key, value as SetupAnswers[typeof key])
  }

  function handleSingleSelect(key: keyof SetupAnswers, value: string) {
    setAnswer(key, value as SetupAnswers[typeof key])
  }

  function handleMultiToggle(key: keyof SetupAnswers, value: string) {
    const current = answers[key]
    const list = Array.isArray(current) ? current : []
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value]
    setAnswer(key, next as SetupAnswers[typeof key])
  }

  if (submitted) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              You are all set!
            </h2>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>
              Your answers have been submitted. We will get in touch soon.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (isSummary) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <ProgressBar current={totalSteps} total={totalSteps} />
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
            Review your answers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {STEPS.map((s) => {
              const val = answers[s.id]
              const display = Array.isArray(val) ? val.join(', ') : val
              return (
                <div
                  key={s.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                    {s.question}
                  </div>
                  <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>
                    {display || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Not answered</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={navStyle}>
            <button type="button" onClick={goBack} style={backButtonStyle}>
              Back
            </button>
            <button type="button" onClick={submit} style={nextButtonStyle}>
              Submit
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <ProgressBar current={currentStep + 1} total={totalSteps} />
        {step && (
          <QuestionCard
            step={step}
            answers={answers}
            onTextChange={handleTextChange}
            onSingleSelect={handleSingleSelect}
            onMultiToggle={handleMultiToggle}
          />
        )}
        <div style={navStyle}>
          {currentStep > 0 && (
            <button type="button" onClick={goBack} style={backButtonStyle}>
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            style={{ ...nextButtonStyle, marginLeft: currentStep === 0 ? 'auto' : undefined }}
          >
            {currentStep === totalSteps - 1 ? 'Review' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F3F4F6',
  padding: '24px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  padding: '40px',
  width: '100%',
  maxWidth: '560px',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '32px',
  gap: '12px',
}

const backButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  border: '2px solid #E5E7EB',
  borderRadius: '8px',
  backgroundColor: '#fff',
  color: '#374151',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
}

const nextButtonStyle: React.CSSProperties = {
  padding: '12px 28px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#2563EB',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  marginLeft: 'auto',
}
