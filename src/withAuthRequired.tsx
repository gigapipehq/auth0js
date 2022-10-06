import { type RedirectLoginOptions, type User } from '@auth0/auth0-spa-js'
import { type ComponentType, useEffect } from 'react'

import { type UseAuthHook } from './authStore'
import { defaultReturnTo } from './utils'

const defaultOnRedirecting = () => <>Redirecting...</>

/**
 * Options for the withAuthenticationRequired Higher Order Component
 */
export interface WithAuthenticationRequiredOptions {
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   returnTo: '/profile'
   * })
   * ```
   *
   * or
   *
   * ```js
   * withAuthenticationRequired(Profile, {
   *   returnTo: () => window.location.hash.substr(1)
   * })
   * ```
   *
   * Add a path for the `onRedirectCallback` handler to return the user to after login.
   */
  returnTo?: string | (() => string)
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   onRedirecting: () => <div>Redirecting you to the login...</div>
   * })
   * ```
   *
   * Render a message to show that the user is being redirected to the login.
   */
  onRedirecting?: () => JSX.Element
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   loginOptions: {
   *     appState: {
   *       customProp: 'foo'
   *     }
   *   }
   * })
   * ```
   *
   * Pass additional login options, like extra `appState` to the login page.
   * This will be merged with the `returnTo` option used by the `onRedirectCallback` handler.
   */
  loginOptions?: RedirectLoginOptions
  /**
   * Check the user object for JWT claims and return a boolean indicating
   * whether or not they are authorized to view the component.
   */
  claimCheck?: (claims?: User) => boolean
  /**
   * Zustand hook that give us reactive access to all the state and the different auth methods. Created with `createAuthHook`
   *
   * ```js
   * const useAuth = createAuthHook(authStore)
   * ```
   */
  useAuth: UseAuthHook
}

/**
 * ```js
 * const MyProtectedComponent = withAuthenticationRequired(MyComponent);
 * ```
 *
 * When you wrap your components in this Higher Order Component and an anonymous user visits your component
 * they will be redirected to the login page and returned to the page they we're redirected from after login.
 */
const withAuthRequired = <P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationRequiredOptions,
) =>
  function WithAuthenticationRequired(props: P): JSX.Element {
    const {
      useAuth,
      loginOptions,
      returnTo = defaultReturnTo,
      onRedirecting = defaultOnRedirecting,
      claimCheck = (): boolean => true,
    } = options

    const isAuthenticated = useAuth(state => state.isAuthenticated)
    const isLoading = useAuth(state => state.isLoading)
    const user = useAuth(state => state.user)
    const loginWithRedirect = useAuth(state => state.loginWithRedirect)

    /**
     * The route is authenticated if the user has valid auth and there are no
     * JWT claim mismatches.
     */
    const routeIsAuthenticated = isAuthenticated && claimCheck(user)

    useEffect(() => {
      if (isLoading || routeIsAuthenticated) {
        return
      }
      const opts = {
        ...loginOptions,
        appState: {
          ...(loginOptions && loginOptions.appState),
          returnTo: typeof returnTo === 'function' ? returnTo() : returnTo,
        },
      }
      ;(async (): Promise<void> => {
        await loginWithRedirect(opts)
      })()
    }, [isLoading, routeIsAuthenticated, loginWithRedirect, loginOptions, returnTo])

    return routeIsAuthenticated ? <Component {...props} /> : onRedirecting()
  }

export default withAuthRequired
