import { type AuthStore } from './authStore'
import type { AppState, Auth0User, User } from './types'
import { defaultReturnTo, transformSnakeObjectKeysToCamel } from './utils'

/**
 * This is a policy function used to authorize a request in a loader function from react-router
 * @param authStore
 * @param callback
 * @param returnTo
 *
 * @example
 * ```js
 *  async function loader({ request }) {
 *      return authorize(
 *        authStore,
 *        async ({ user }) => {
 *          // here we can get the data for this route and return it.
 *        },
 *        '/welcome'
 *    )
 *  }
 * ```
 */
export const authorize = async <LoaderReturn = Response>(
  authStore: AuthStore,
  callback: (input: { user: User }) => Promise<LoaderReturn>,
  returnTo = defaultReturnTo,
) => {
  const {
    user,
    auth0Client,
    actions: { loginWithRedirect },
    _actions: { initialised },
  } = authStore.getState()
  if (user) return callback({ user })

  await auth0Client.checkSession()
  const auth0User = await auth0Client.getUser<Auth0User>()

  if (!auth0User) {
    return loginWithRedirect({
      appState: { returnTo },
      onRedirect: async url => {
        window.location.replace(url)
        return new Promise(resolve => {
          setTimeout(resolve, 1000)
        })
      },
    })
  }
  initialised(auth0User)

  return callback({ user: transformSnakeObjectKeysToCamel(auth0User) })
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
  const {
    auth0Client,
    _actions: { initialised },
  } = authStore.getState()

  const { appState } = await auth0Client.handleRedirectCallback<AppState>()
  const auth0User = await auth0Client.getUser<Auth0User>()
  initialised(auth0User)

  return callback({ appState })
}
