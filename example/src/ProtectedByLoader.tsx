import { type LoaderFunctionArgs, json, useLoaderData } from 'react-router-dom'
import { authStore } from './auth'

export async function loader({ request }: LoaderFunctionArgs) {
  const returnTo = new URL(request.url).pathname
  const { isAuthenticated, isLoading, loginWithRedirect } = authStore.getState()

  /**
   * First validate that the user is not already authenticated or that the auth client is still initializing.
   * Its important to return a Response (ie. using the json utility from React Router) so the execution of the loader is stoped
   */
  if (isLoading || isAuthenticated) return json('GO!', { status: 200 })

  /**
   * If the user is not authenticated log it in
   */
  await loginWithRedirect({
    appState: { returnTo },
    /**
     * The navigation to the Auth0 authorization page done by `loginWithRedirect` take some time.
     * While this happens the `loginWithRedirect` function would resolve therefore continuing the execution of the `loader`.
     * As a result the protected page content would be rendered triggering any further fetch without a proper accessToken.
     */
    onRedirect: async url => {
      window.location.replace(url)
      return new Promise(resolve => setTimeout(resolve, 1000))
    },
  })
}

export default function ProtectedByLoader() {
  const loaderData = useLoaderData()

  return (
    <div>
      {`${loaderData} This route is protected by its loader, you will never see this unless you are
      authenticated`}
    </div>
  )
}
