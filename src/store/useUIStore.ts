import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  search: string
  view: 'grid' | 'list'
  showAddForm: boolean
  isScrolled: boolean
}

interface UIActions {
  setSearch: (search: string) => void
  setView: (view: 'grid' | 'list') => void
  setShowAddForm: (show: boolean) => void
  setIsScrolled: (scrolled: boolean) => void
  resetSearch: () => void
  toggleView: () => void
  toggleAddForm: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      search: '',
      view: 'grid',
      showAddForm: false,
      isScrolled: false,

      // Actions
      setSearch: (search) => set({ search }),
      
      setView: (view) => set({ view }),
      
      setShowAddForm: (show) => set({ showAddForm: show }),
      
      setIsScrolled: (scrolled) => set({ isScrolled: scrolled }),
      
      resetSearch: () => set({ search: '' }),
      
      toggleView: () => set((state) => ({ 
        view: state.view === 'grid' ? 'list' : 'grid' 
      })),
      
      toggleAddForm: () => set((state) => ({ 
        showAddForm: !state.showAddForm 
      })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        view: state.view,
        search: state.search 
      }),
    }
  )
) 