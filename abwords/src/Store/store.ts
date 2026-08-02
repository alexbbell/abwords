import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 1. Define combined state & action types
interface CounterSlice {
  counter: number
  increment: () => void
  decrement: () => void
}

interface AnswerSlice {
  answers: Record<string, any>
  setAnswer: (key: string, value: any) => void
  resetAnswers: () => void
}

type StoreState = CounterSlice & AnswerSlice

// 2. Create the persisted store
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // --- Counter Slice ---
      counter: 0,
      increment: () => set((state) => ({ counter: state.counter + 1 })),
      decrement: () => set((state) => ({ counter: state.counter - 1 })),

      // --- Answer Slice ---
      answers: {},
      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),
      resetAnswers: () => set({ answers: {} }),
    }),
    {
      name: 'root', // Key in localStorage (replaces persistConfig.key)
      storage: createJSONStorage(() => localStorage), // Defaults to localStorage
    }
  )
)