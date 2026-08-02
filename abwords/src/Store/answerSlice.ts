import { create } from 'zustand'
import { IAnswer } from '../Components/WordMemory/data'

export interface AnswerState {
  answers: IAnswer[]
  addItem: (item: IAnswer) => void
  cleanItems: () => void
}

export const useAnswerStore = create<AnswerState>((set) => ({
  answers: [],

  // Action to add an item
  addItem: (item) =>
    set((state) => ({
      answers: [...state.answers, item],
    })),

  // Action to clear all items
  cleanItems: () => set({ answers: [] }),
}))