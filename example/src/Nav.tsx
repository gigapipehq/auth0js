import { useLocation, Link } from 'react-router-dom'

import { useAuth } from './auth'

export function Nav() {
  const isAuthenticated = useAuth(state => state.isAuthenticated)
  const user = useAuth(state => state.user)
  const logout = useAuth(state => state.logout)
  const loginWithRedirect = useAuth(state => state.loginWithRedirect)
  const getAccessTokenSilently = useAuth(state => state.getAccessTokenSilently)

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
            onClick={() => getAccessTokenSilently().then(console.log).catch(console.log)}
          >
            get access token
          </button>
        </div>
      ) : (
        <button className="btn btn-outline-success" id="login" onClick={() => loginWithRedirect()}>
          login
        </button>
      )}
    </nav>
  )
}
