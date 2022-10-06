import {
  type Auth0ClientOptions,
  type GetTokenSilentlyOptions,
  type IdToken,
  type LogoutOptions,
  type RedirectLoginOptions,
  type User,
  Auth0Client,
} from '@auth0/auth0-spa-js'
import { type StoreApi, type UseBoundStore, createStore } from 'zustand'

import { tokenError } from './utils'

type AuthState<TUser extends User = User> = {
  auth0Client: Auth0Client
  isLoading: boolean
  isAuthenticated: boolean
  error?: Error
  user?: TUser
  initialised: (user?: User) => void
  setError: (error: Error) => void
  loginWithRedirect: (loginOptions?: RedirectLoginOptions) => Promise<void>
  logout: (logoutOptions?: LogoutOptions) => Promise<void>
  getAccessTokenSilently: (getTokenOptions?: GetTokenSilentlyOptions) => Promise<string>
  getIdTokenClaims: () => Promise<IdToken | undefined>
}

/**
 *  Function factory to create the Zustand store that contains all the state and the different auth methods.
 *  Use this store outside the React tree (ie. `const { isAuthenticated, loginWithRedirect } = authStore.getState()`) or if you only need access to its methods.
 * ```js
 * const authStore = createAuthStore({
 *  domain: import.meta.env.VITE_AUTH0_DOMAIN,
 *  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
 *  useRefreshTokens: true,
 *  authorizationParams: {
 *    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
 *    redirect_uri: window.location.origin,
 *  },
 * }
 * ```
 *
 * Then you can use the `createAuthHook` function to create a custom hook for easy access inside React components
 * ```js
 * const useAuth = createAuthHook(authStore)
 * ```
 */
export const createAuthStore = (options: Auth0ClientOptions) =>
  createStore<AuthState>()((set, get) => ({
    isLoading: true,
    isAuthenticated: false,
    auth0Client: new Auth0Client(options),
    initialised: user =>
      set(state => ({
        ...state,
        isAuthenticated: !!user,
        user,
        isLoading: false,
        error: undefined,
      })),
    setError: error => set(state => ({ ...state, isLoading: false, error })),
    loginWithRedirect: loginOptions => {
      const { auth0Client } = get()
      return auth0Client.loginWithRedirect(loginOptions)
    },
    logout: logoutOptions => {
      const { auth0Client } = get()
      return auth0Client.logout(logoutOptions)
    },
    getAccessTokenSilently: async getTokenOptions => {
      const { auth0Client } = get()
      let token

      try {
        token = await auth0Client.getTokenSilently(getTokenOptions)
      } catch (error) {
        throw tokenError(error as Error)
      } finally {
        const user = await auth0Client.getUser()
        set(state =>
          state.user?.updated_at === user?.updated_at
            ? state
            : { ...state, isAuthenticated: !!user, user },
        )
      }
      return token
    },
    getIdTokenClaims: () => {
      const { auth0Client } = get()
      return auth0Client.getIdTokenClaims()
    },
  }))

export type AuthStore = ReturnType<typeof createAuthStore>
export type UseAuthHook = UseBoundStore<StoreApi<AuthState>>
