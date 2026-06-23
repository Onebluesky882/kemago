'use client'
import { useState } from 'react'
import { useSetupStore } from '@/store/setup.store'
import type { SetupAnswers } from '@/store/setup.store'

const TOTAL_STEPS = 4

export type StepConfig = {
  id: keyof SetupAnswers
  question: string
  type: 'text' | 'textarea' | 'single' | 'multi' | 'swatches'
  options?: Array<{ label: string; value: string; color?: string }>
}

export const STEPS: StepConfig[] = [
  {
    id: 'businessName',
    question: 'What is your business name?',
    type: 'text',
  },
  {
    id: 'businessDescription',
    question: 'What does your business do?',
    type: 'textarea',
  },
  {
    id: 'targetCustomers',
    question: 'Who are your customers?',
    type: 'textarea',
  },
  {
    id: 'websiteFeatures',
    question: 'What do you need? (Select all that apply)',
    type: 'multi',
    options: [
      { label: 'Sell products online', value: 'ecommerce' },
      { label: 'Accept bookings / appointments', value: 'bookings' },
      { label: 'Member login / register', value: 'members' },
      { label: 'Accept online payments', value: 'payments' },
      { label: 'Blog / articles', value: 'blog' },
      { label: 'Contact form', value: 'contact' },
      { label: 'Show business info only', value: 'portfolio' },
    ],
  },
]

export function useSetup() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { answers, setAnswer } = useSetupStore()

  const totalSteps = STEPS.length
  const isLastStep = currentStep === totalSteps - 1
  const isSummary = currentStep === totalSteps
  const step = STEPS[currentStep]

  function goNext() {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1)
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  async function submit() {
    try {
      await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
    } catch {
      // stub — console.log for now; real API in stage-8
      console.log('Setup answers submitted:', answers)
    }
    setSubmitted(true)
  }

  return {
    currentStep,
    totalSteps,
    isLastStep,
    isSummary,
    step,
    answers,
    submitted,
    setAnswer,
    goNext,
    goBack,
    submit,
  }
}
