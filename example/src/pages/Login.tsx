import { authorize } from '@gigapipe/auth0js'
import { LoaderFunctionArgs, redirect } from 'react-router-dom'
import { authStore } from '../auth'

export async function loader({ request }: LoaderFunctionArgs) {
  const { loginWithRedirect } = authStore.getState().actions
  const url = new URL(request.url)
  const organization = url.searchParams.get('organization')

  if (organization) {
    return loginWithRedirect({
      appState: { returnTo: '/', isOrganizationLogin: true },
      authorizationParams: { organization },
    })
  }

  return authorize(authStore, async () => redirect('/'), '/')
}

export default function Login() {
  return null
}
