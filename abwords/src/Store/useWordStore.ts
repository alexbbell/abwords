import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WordCollection } from '../Components/MyWordCollections/MyWordCollections';

// --- Types & Interfaces ---

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface Tokens {
  accessToken: string | null;
  refreshToken?: string | null;
}

type Mode = 'idle' | 'viewing' | 'learning';

interface AuthState {
  user: User | null;
  tokens: Tokens;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, tokens: Tokens) => void;
  logout: () => void;
  updateTokens: (tokens: Tokens) => void;
}

interface WordCollectionState {
  selectedCollection: WordCollection | null;
  mode: Mode;
  
  // Actions
  startLearning: (collection: WordCollection) => void;
  viewCollection: (collection: WordCollection) => void;
  clearSelection: () => void;
}

type StoreState = WordCollectionState & AuthState;

export const useWordStore = create<StoreState>()(
  persist(
    (set) => ({
      // --- Auth Initial State ---
      user: null,
      tokens: { accessToken: null },
      isAuthenticated: false,

      // --- Auth Actions ---
      setAuth: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          tokens: { accessToken: null },
          isAuthenticated: false,
          // Reset UI/word state on logout
          selectedCollection: null,
          mode: 'idle',
        }),

      updateTokens: (tokens) =>
        set({ tokens }),

      // --- Word Collection State ---
      selectedCollection: null,
      mode: 'idle',

      // --- Word Collection Actions ---
      startLearning: (collection) =>
        set({ selectedCollection: collection, mode: 'learning' }),

      viewCollection: (collection) =>
        set({ selectedCollection: collection, mode: 'viewing' }),

      clearSelection: () =>
        set({ selectedCollection: null, mode: 'idle' }),
    }),
    {
      name: 'word-app-auth-storage', // Key name in localStorage
      storage: createJSONStorage(() => localStorage), // Explicitly define storage engine
      
      // Selectively state properties to keep persistent
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);