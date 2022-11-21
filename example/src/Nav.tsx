import { useLocation, Link } from 'react-router-dom'
import { faker } from '@faker-js/faker'

import { authStore, useAuthActions, useAuthenticated, useUser } from './auth'

const simulateAPIRequest = async () => {
  const { getAccessTokenSilently } = authStore.getState().actions
  const accessToken = await getAccessTokenSilently()
  console.log('Here is your access token: ', accessToken)
}

export function Nav() {
  const isAuthenticated = useAuthenticated()
  const user = useUser()
  const { logout, loginWithRedirect, updateUser } = useAuthActions()
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
            <div className="column">
              <button
                className="btn btn-outline-secondary"
                id="update-user"
                onClick={async () => {
                  const givenName = faker.name.firstName()
                  await updateUser({ givenName, updatedAt: new Date(Date.now()).toISOString() })
                }}
              >
                update user
              </button>
              <p>Update the user object in the store with some random information</p>
            </div>
            <div className="column">
              <button
                className="btn btn-outline-secondary"
                id="update-user"
                onClick={async () => {
                  const givenName = faker.name.firstName()
                  await updateUser({ givenName }, { fetchNewToken: true })
                }}
              >
                force update user
              </button>
              <p>Update the user object in the store by fetching new tokens from Auth0</p>
            </div>
          </>
        ) : (
          <>
            <div className="column">
              <button
                className="btn btn-outline-success"
                id="login"
                onClick={() => loginWithRedirect()}
              >
                login
              </button>
              <p>Login as an individual</p>
            </div>
            {import.meta.env.VITE_AUTH0_ORG_ID && (
              <div className="column">
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
                <p>Define VITE_AUTH0_ORG_ID in your .env.local file</p>
              </div>
            )}
            <div className="column">
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
              <p>Signup</p>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
