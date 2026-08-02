import { create } from 'zustand';
import { WordCollection } from '../Components/MyWordCollections/MyWordCollections';

// Adjust interfaces to match your data types

type Mode = 'idle' | 'viewing' | 'learning';

interface WordState {
  selectedCollection: WordCollection | null;
  mode: Mode;
  
  // Actions
  startLearning: (collection: WordCollection) => void;
  viewCollection: (collection: WordCollection) => void;
  clearSelection: () => void;
}

export const useWordStore = create<WordState>((set) => ({
  selectedCollection: null,
  mode: 'idle',

  startLearning: (collection) => 
    set({ selectedCollection: collection, mode: 'learning' }),

  viewCollection: (collection) => 
    set({ selectedCollection: collection, mode: 'viewing' }),

  clearSelection: () => 
    set({ selectedCollection: null, mode: 'idle' }),
}));
