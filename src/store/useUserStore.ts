import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/User'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface UserActions {
  setUser: (user: User | null) => void
  login: (user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      login: (user) => set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
) 