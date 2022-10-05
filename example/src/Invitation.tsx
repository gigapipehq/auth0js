import { type LoaderFunctionArgs } from 'react-router-dom'
import { authStore } from './auth'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const invitation = url.searchParams.get('invitation')
  const organization = url.searchParams.get('organization')
  const { loginWithRedirect } = authStore.getState()
  if (invitation && organization) {
    await loginWithRedirect({
      authorizationParams: {
        organization,
        invitation,
      },
    })
  }
}

export default function Invitation() {
  return (
    <div>
      This is the application's login page. In some scenarios like after user gets an invitation
      they will be directed here. This page could ommit rendering any component and only use the
      loader function.
    </div>
  )
}
