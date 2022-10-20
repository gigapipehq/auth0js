import { type AuthStore } from './authStore'
import type { AppState, Auth0User, User } from './types'
import { defaultReturnTo, transformSnakeObjectKeysToCamel } from './utils'

/**
 * This is a policy function used to authorize a request in a loader function from react-router
 * @param authStore
 * @param callback
 *
 * @example
 * ```js
 *  async function loader({ request }) {
 *      return authorize(authStore, async ({ user }) => {
 *          // here we can get the data for this route and return it.
 *      })
 *  }
 * ```
 */
export const authorize = async <LoaderReturn = Response>(
  authStore: AuthStore,
  callback: (input: { user: User }) => Promise<LoaderReturn>,
) => {
  const { user, loginWithRedirect, auth0Client, initialised } = authStore.getState()

  try {
    if (user) return await callback({ user })

    await auth0Client.checkSession()
    const auth0User = await auth0Client.getUser<Auth0User>()

    if (!auth0User) throw new Error('Unauthorized')
    initialised(auth0User)

    return await callback({ user: transformSnakeObjectKeysToCamel(auth0User) })
  } catch (error) {
    return await loginWithRedirect({
      appState: { returnTo: defaultReturnTo },
      onRedirect: async url => {
        window.location.replace(url)
        return new Promise(resolve => {
          setTimeout(resolve, 1000)
        })
      },
    })
  }
}

/**
 * This is a policy function used to handle the redirection from Auth0
 * @param authStore
 * @param callback
 *
 * @example
 * ```js
 * // loader from route where Auth0 redirects users
 *  async function loader({ request }) {
 *      // handle other flows managed by the same route.
 *
 *      // handle default flow
 *      return handleRedirectCallback(authStore, async ({ appState }) => {
 *          return redirect(appState.returnTo)
 *      })
 *  }
 * ```
 */
export const handleRedirectCallback = async <LoaderReturn = Response>(
  authStore: AuthStore,
  callback: (input: { appState?: AppState }) => Promise<LoaderReturn>,
) => {
  const { auth0Client, initialised } = authStore.getState()

  const { appState } = await auth0Client.handleRedirectCallback<AppState>()
  const auth0User = await auth0Client.getUser<Auth0User>()
  initialised(auth0User)

  return callback({ appState })
}
