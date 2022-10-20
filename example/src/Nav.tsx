import { useLocation, Link } from 'react-router-dom'

import { authStore, useAuth } from './auth'

const simulateAPIRequest = async () => {
  const { getAccessTokenSilently } = authStore.getState()
  const accessToken = await getAccessTokenSilently()
  console.log('Here it is your access token: ', accessToken)
}

export function Nav() {
  const isAuthenticated = useAuth(state => state.isAuthenticated)
  const user = useAuth(state => state.user)
  const logout = useAuth(state => state.logout)
  const loginWithRedirect = useAuth(state => state.loginWithRedirect)

  const { pathname } = useLocation()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <span className="navbar-brand">@gigapipe/auth0js</span>
      <div className="collapse navbar-collapse">
        <div className="navbar-nav">
          <Link to="/" className={`nav-item nav-link${pathname === '/' ? ' active' : ''}`}>
            Home
          </Link>
          <Link
            to="/protected"
            className={`nav-item nav-link${pathname === '/users' ? ' active' : ''}`}
          >
            Protected route
          </Link>
          <Link
            to="/auth"
            className={`nav-item nav-link${pathname === '/invitation' ? ' active' : ''}`}
          >
            Callback route
          </Link>
        </div>
      </div>

      {isAuthenticated ? (
        <div>
          <span id="hello">Hello, {user?.givenName}!</span>{' '}
          <button className="btn btn-outline-secondary" id="logout" onClick={() => logout()}>
            logout
          </button>
          <button
            className="btn btn-outline-secondary"
            id="get-token"
            onClick={() => simulateAPIRequest()}
          >
            get access token
          </button>
        </div>
      ) : (
        <>
          <button
            className="btn btn-outline-success"
            id="login"
            onClick={() => loginWithRedirect()}
          >
            login
          </button>
        </>
      )}
    </nav>
  )
}
