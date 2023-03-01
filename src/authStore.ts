import {
  Auth0Client,
  type Auth0ClientOptions,
  type GetTokenSilentlyOptions,
  type IdToken,
  type LogoutOptions,
  type RedirectLoginOptions,
} from '@auth0/auth0-spa-js'
import { createStore, StoreApi } from 'zustand'

import type { Auth0User, SnakeCasedProperties } from './types'
import { defaultLogoutReturnTo, tokenError, transformSnakeObjectKeysToCamel } from './utils'

interface AuthState<TUser extends Auth0User = Auth0User> {
  /**
   * Auth0 SDK for SPAs
   */
  auth0Client: Auth0Client
  isLoading: boolean
  /**
   * Flag to indicate if the user is authenticated
   */
  isAuthenticated: boolean
  /**
   * Any error saved in the store while interacting with Auth0
   */
  error?: Error
  /**
   * The user object
   *
   * You can provide it via a generic type or it will default to the User from the Auth0 SDK
   * @default Auth0User
   */
  user?: TUser
  /**
   * Internal action DO NOT USE
   */
  _actions: {
    initialised: (user?: TUser) => void
  }
  /**
   * All available actions to interact with Auth0
   */
  actions: {
    /**
     * ```js
     * await loginWithRedirect(options);
     * ```
     *
     * Performs a redirect to the `/authorize` route in Auth0 using the parameters provided as arguments.
     *
     * @param options
     */
    loginWithRedirect: (loginOptions?: RedirectLoginOptions) => Promise<null>
    /**
     * ```js
     * await logout(options);
     * ```
     *
     * Clears the application session and performs a redirect to the login route defind in Auth0
     *
     * */
    logout: (logoutOptions?: LogoutOptions) => Promise<null>
    /**
     * ```js
     * const accessToken = await getAccessTokenSilently(options);
     * ```
     *
     * Fetches a new access token and return it
     * It also uses it to get an updated user and save it in the store
     */
    getAccessTokenSilently: (getTokenOptions?: GetTokenSilentlyOptions) => Promise<string>
    /**
     * ```js
     * const claims = await getIdTokenClaims();
     * ```
     *
     * Returns all claims from the id_token if available.
     */
    getIdTokenClaims: () => Promise<IdToken | undefined>
    /**
     * ```js
     * const user =  await updateUser({ givenName: 'Alfredo' });
     * const user =  await updateUser({ givenName: 'Alfredo' }, { fetchNewToken: true });
     * ```
     *
     * A function to update the user in the store or force a fetching of the information from Auth0
     */
    updateUser: (
      user: Partial<TUser>,
      options?: { fetchNewToken?: boolean },
    ) => Promise<TUser | undefined>
  }
}

/**
 *  Function factory to create the Zustand store that contains all the state and the different auth methods.
 *  Use this store outside the React tree (ie. `const { isAuthenticated, loginWithRedirect } = authStore.getState()`) or if you only need access to its methods.
 * ```js
 * const authStore = createAuthStore<CustomUserType>({
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
 * Then you can use the `useStore` hook from Zustand to create the custom hooks (see example).
 * ```js
 * const useUser = useStore(authStore, state => state.user)
 * ```
 * Accepts an optional generic to customize the type for the user object. Use it only if you have extended the IDToken in Auth0 or you use the organizations feature
 *
 * ```ts
 *  interface CustomUserType extends Auth0User {
 *    connection: string
 *    orgId?: string
 *  }
 * ```
 */
export const createAuthStore = <TUser extends Auth0User = Auth0User>(options: Auth0ClientOptions) =>
  createStore<AuthState<TUser>>()((set, get) => ({
    isLoading: true,
    isAuthenticated: false,
    auth0Client: new Auth0Client(options),
    _actions: {
      initialised: user =>
        set(state => ({
          ...state,
          isAuthenticated: !!user,
          user,
          isLoading: false,
          error: undefined,
        })),
    },
    actions: {
      loginWithRedirect: async loginOptions => {
        const { auth0Client } = get()
        await auth0Client.loginWithRedirect(loginOptions)
        return null
      },
      logout: async logoutOptions => {
        const { auth0Client } = get()
        await auth0Client.logout({
          ...logoutOptions,
          logoutParams: { returnTo: defaultLogoutReturnTo, ...logoutOptions?.logoutParams },
        })
        return null
      },
      getAccessTokenSilently: async getTokenOptions => {
        const { auth0Client } = get()
        let token

        try {
          token = await auth0Client.getTokenSilently(getTokenOptions)
        } catch (error: any) {
          throw tokenError(error)
        } finally {
          const auth0User = await auth0Client.getUser<SnakeCasedProperties<TUser>>()
          if (auth0User) {
            const user = transformSnakeObjectKeysToCamel(auth0User) as TUser

            set(state =>
              state.user?.updatedAt === user.updatedAt
                ? state
                : { ...state, isAuthenticated: !!user, user },
            )
          }
        }
        return token
      },
      getIdTokenClaims: () => {
        const { auth0Client } = get()
        return auth0Client.getIdTokenClaims()
      },
      updateUser: async (user, ops = { fetchNewToken: false }) => {
        if (ops.fetchNewToken) {
          const { getAccessTokenSilently } = get().actions
          await getAccessTokenSilently({ cacheMode: 'off' })
          return get().user
        }
        const currentUser = get().user
        const newUser = { ...currentUser, ...user } as TUser
        set(state => ({ ...state, user: newUser }))
        return newUser
      },
    },
  }))

export type AuthStore<TUser extends Auth0User> = StoreApi<AuthState<TUser>>
