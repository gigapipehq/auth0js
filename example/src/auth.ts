import { createAuthStore, createAuthHook } from '@gigapipe/auth0js'

export const authStore = createAuthStore({
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
const useAuth = createAuthHook(authStore)

export const useUser = () => useAuth(state => state.user)
export const useAuthenticated = () => useAuth(state => state.isAuthenticated)
export const useAuthActions = () => useAuth(state => state.actions)
