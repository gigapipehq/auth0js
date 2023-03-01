import { createAuthStore, Auth0User } from '@gigapipe/auth0js'
import { useStore } from 'zustand'

interface CustomUser extends Auth0User {
  connection: string
  orgId?: string
}

export const authStore = createAuthStore<CustomUser>({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  useRefreshTokens: true,
  useRefreshTokensFallback: true,
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: `${window.location.origin}/auth`,
  },
})

/**
 * Instead of exporting a hook with access to the entire store, requiring you to perform the state selection each time.
 * It is recomended to create all the custom hook you need that expose, and therefore subscribe the component, to an atomic part of the store.
 */
export const useUser = () => useStore(authStore, state => state.user)
export const useAuthenticated = () => useStore(authStore, state => state.isAuthenticated)
export const useAuthActions = () => useStore(authStore, state => state.actions)
