import { create } from 'zustand'

export type SetupAnswers = {
  businessName: string
  businessDescription: string
  targetCustomers: string
  language: string
  websiteFeatures: string[]
  needsAdminPanel: string
  onlinePayments: string
  preferredStyle: string
}

type SetupStore = {
  answers: SetupAnswers
  setAnswer: <K extends keyof SetupAnswers>(key: K, value: SetupAnswers[K]) => void
  reset: () => void
}

const defaultAnswers: SetupAnswers = {
  businessName: '',
  businessDescription: '',
  targetCustomers: '',
  language: '',
  websiteFeatures: [],
  needsAdminPanel: '',
  onlinePayments: '',
  preferredStyle: '',
}

export const useSetupStore = create<SetupStore>((set) => ({
  answers: { ...defaultAnswers },
  setAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),
  reset: () => set({ answers: { ...defaultAnswers } }),
}))
