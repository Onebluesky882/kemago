'use client'
import { useState } from 'react'
import { useSetupStore } from '@/store/setup.store'
import type { SetupAnswers } from '@/store/setup.store'

const TOTAL_STEPS = 8

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
    id: 'language',
    question: 'What language should your website be in?',
    type: 'single',
    options: [
      { label: 'Thai', value: 'thai' },
      { label: 'English', value: 'english' },
      { label: 'Both Thai and English', value: 'both' },
    ],
  },
  {
    id: 'websiteFeatures',
    question: 'What do you want your website to do? (Select all that apply)',
    type: 'multi',
    options: [
      { label: 'Show business info / portfolio', value: 'portfolio' },
      { label: 'Accept orders / sell products online', value: 'ecommerce' },
      { label: 'Accept bookings / appointments', value: 'bookings' },
      { label: 'Member system (login / register)', value: 'members' },
      { label: 'Articles / blog / news', value: 'blog' },
      { label: 'Contact form / quote request', value: 'contact' },
      { label: 'Photo gallery', value: 'gallery' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    id: 'needsAdminPanel',
    question: 'Do you need an admin panel to manage things yourself?',
    type: 'single',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'onlinePayments',
    question: 'Do you want to accept online payments?',
    type: 'single',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Later', value: 'later' },
    ],
  },
  {
    id: 'preferredStyle',
    question: 'What style do you prefer?',
    type: 'swatches',
    options: [
      { label: 'Clean', value: 'clean', color: '#F8F9FA' },
      { label: 'Elegant', value: 'elegant', color: '#2C2C2C' },
      { label: 'Bright', value: 'bright', color: '#FF6B35' },
      { label: 'Formal', value: 'formal', color: '#1A3A5C' },
    ],
  },
]

export function useSetup() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { answers, setAnswer } = useSetupStore()

  const totalSteps = TOTAL_STEPS
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
