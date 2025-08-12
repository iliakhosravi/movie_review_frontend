import { create } from 'zustand'

interface ErrorState {
  error: string
  hasError: boolean
  errorType: 'error' | 'warning' | 'info' | null
}

interface ErrorActions {
  setError: (error: string, type?: 'error' | 'warning' | 'info') => void
  clearError: () => void
  showError: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

type ErrorStore = ErrorState & ErrorActions

export const useErrorStore = create<ErrorStore>((set) => ({
  // State
  error: '',
  hasError: false,
  errorType: null,

  // Actions
  setError: (error, type = 'error') => set({ 
    error, 
    hasError: !!error,
    errorType: error ? type : null 
  }),
  
  clearError: () => set({ 
    error: '', 
    hasError: false,
    errorType: null 
  }),
  
  showError: (message) => set({ 
    error: message, 
    hasError: true,
    errorType: 'error' 
  }),
  
  showWarning: (message) => set({ 
    error: message, 
    hasError: true,
    errorType: 'warning' 
  }),
  
  showInfo: (message) => set({ 
    error: message, 
    hasError: true,
    errorType: 'info' 
  }),
})) 