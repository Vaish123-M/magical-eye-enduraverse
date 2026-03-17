import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { clearAuthToken, getAuthToken, setAuthToken } from '@/services/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: getAuthToken(),
      isAuthenticated: !!getAuthToken(),
      username: null,
      loginSuccess: (token, username) => {
        setAuthToken(token)
        set({ token, username, isAuthenticated: true })
      },
      logout: () => {
        clearAuthToken()
        set({ token: null, username: null, isAuthenticated: false })
      },
    }),
    {
      name: 'magicaleye-auth',
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
