import { useEffect } from 'react'
import { useAuth } from './auth'

export default function Invitation() {
  const loginWithRedirect = useAuth(state => state.loginWithRedirect)

  useEffect(() => {
    const url = window.location.href
    const inviteMatches = url.match(/invitation=([^&]+)/)
    const orgMatches = url.match(/organization=([^&]+)/)

    if (inviteMatches && orgMatches) {
      loginWithRedirect({
        authorizationParams: {
          organization: orgMatches[1],
          invitation: inviteMatches[1],
        },
      })
    } else {
      console.log('No invitation nor organization found in the URL params')
    }
  }, [])

  return <div>This is the landing page to accept invitations, you should be redirected soon.</div>
}
