import { type User } from '@auth0/auth0-spa-js'
import { type ReactNode, useEffect, useRef } from 'react'

import { type AuthStore } from './authStore'
import { type AppState } from './types'
import { hasAuthParams } from './utils'

export type AuthProviderOptions = {
  children: ReactNode
  /**
   * By default this removes the code and state parameters from the url when you are redirected from the authorize page.
   * It uses `window.history` but you might want to overwrite this if you are using a custom router, like `react-router-dom`
   * See the example folder.
   */
  onRedirectCallback?: (appState?: AppState, user?: User) => void
  /**
   * By default, if the page url has code/state params, the SDK will treat them as Auth0's and attempt to exchange the
   * code for a token. In some cases the code might be for something else (another OAuth SDK perhaps). In these
   * instances you can instruct the client to ignore them eg
   *
   * ```jsx
   * <AuthProvider
   *   clientId={clientId}
   *   domain={domain}
   *   skipRedirectCallback={window.location.pathname === '/stripe-oauth-callback'}
   * >
   * ```
   */
  skipRedirectCallback?: boolean
  /**
   * Zustand store that contains all the state and the different auth methods. Created with `createAuthStore`
   *
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
   */
  authStore: AuthStore
}

const defaultOnRedirectCallback = (appState?: AppState): void => {
  window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname)
}

const AuthProvider = (opts: AuthProviderOptions) => {
  const {
    children,
    skipRedirectCallback,
    onRedirectCallback = defaultOnRedirectCallback,
    authStore,
  } = opts
  // We can use directly the Zustand's store because we are only accessing the methods and not the state itself.
  // Checkout `withAuthRequired` for an example that requires access to the useAuth hook.
  const { auth0Client, initialised, setError } = authStore.getState()

  const didInitialise = useRef(false)

  useEffect(() => {
    if (didInitialise.current) {
      return
    }
    didInitialise.current = true
    ;(async (): Promise<void> => {
      try {
        let user: User | undefined
        if (hasAuthParams() && !skipRedirectCallback) {
          const { appState } = await auth0Client.handleRedirectCallback()
          user = await auth0Client.getUser()
          initialised(user)
          onRedirectCallback(appState, user)
        } else {
          await auth0Client.checkSession()
          user = await auth0Client.getUser()
          initialised(user)
        }
      } catch (error) {
        setError(error as Error)
      }
    })()
  }, [auth0Client, initialised, onRedirectCallback, setError, skipRedirectCallback])
  return <>{children}</>
}

export default AuthProvider
