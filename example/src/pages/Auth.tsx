import { handleRedirectCallback } from '@gigapipe/auth0js'
import { LoaderFunctionArgs, redirect } from 'react-router-dom'
import { authStore } from '../auth'

export async function loader({ request }: LoaderFunctionArgs) {
  const { loginWithRedirect } = authStore.getState().actions

  const url = new URL(request.url)
  const invitation = url.searchParams.get('invitation')
  const organization = url.searchParams.get('organization')

  if (organization && invitation) {
    return loginWithRedirect({
      appState: { returnTo: '/', isInviteLogin: true },
      authorizationParams: { organization, invitation },
    })
  }

  return handleRedirectCallback(authStore, async ({ appState }) =>
    redirect(appState?.returnTo ?? '/'),
  )
}

export default function Auth() {
  return null
}
