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
      <span className="navbar-brand">@auth0/auth0-react</span>
      <div className="collapse navbar-collapse">
        <div className="navbar-nav">
          <Link to="/" className={`nav-item nav-link${pathname === '/' ? ' active' : ''}`}>
            Home
          </Link>
          <Link
            to="/protected"
            className={`nav-item nav-link${pathname === '/users' ? ' active' : ''}`}
          >
            Protected
          </Link>
          <Link
            to="/protected-by-loader"
            className={`nav-item nav-link${pathname === '/users' ? ' active' : ''}`}
          >
            Protected by loader
          </Link>
          <Link
            to="/auth0"
            className={`nav-item nav-link${pathname === '/invitation' ? ' active' : ''}`}
          >
            Application login page
          </Link>
        </div>
      </div>

      {isAuthenticated ? (
        <div>
          <span id="hello">Hello, {user?.name}!</span>{' '}
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
