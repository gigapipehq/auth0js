import { useLocation, Link } from 'react-router-dom'

import { authStore, useAuth } from './auth'

const simulateAPIRequest = async () => {
  const { getAccessTokenSilently } = authStore.getState()
  const accessToken = await getAccessTokenSilently()
  console.log('Here is your access token: ', accessToken)
}

export function Nav() {
  const isAuthenticated = useAuth(state => state.isAuthenticated)
  const user = useAuth(state => state.user)
  const logout = useAuth(state => state.logout)
  const loginWithRedirect = useAuth(state => state.loginWithRedirect)

  const { pathname } = useLocation()

  return (
    <nav>
      <span>@gigapipe/auth0js</span>
      <div>
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
      <div className="actions">
        {isAuthenticated ? (
          <>
            <span id="hello">Hello, {user?.givenName}!</span>
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
          </>
        ) : (
          <>
            <div className="column">
              <p>Login as an individual</p>
              <button
                className="btn btn-outline-success"
                id="login"
                onClick={() => loginWithRedirect()}
              >
                login
              </button>
            </div>
            {import.meta.env.VITE_AUTH0_ORG_ID && (
              <div className="column">
                <p>Define VITE_AUTH0_ORG_ID in your .env.local file</p>
                <button
                  className="btn btn-outline-success"
                  id="login-org"
                  onClick={() =>
                    loginWithRedirect({
                      authorizationParams: { organization: import.meta.env.VITE_AUTH0_ORG_ID },
                    })
                  }
                >
                  login into organization
                </button>
              </div>
            )}
            <div className="column">
              <p>Signup</p>
              <button
                className="btn btn-outline-success"
                id="signup"
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: {
                      screen_hint: 'signup',
                    },
                  })
                }
              >
                signup
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
