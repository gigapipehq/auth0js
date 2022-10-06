import './App.css'

import { AuthProvider, withAuthRequired } from '@gigapipe/auth0-react'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { mountStoreDevtool } from 'simple-zustand-devtools'

import { authStore, useAuth } from './auth'
import Home from './Home'
import ProtectedByLoader, { loader as protectedRouteLoader } from './ProtectedByLoader'
import ProtectedRoute from './ProtectedRoute'
import Root from './Root'
import Invitation, { loader as invitationLoader } from './Invitation'

if (import.meta.env.DEV) {
  mountStoreDevtool('AuthStore', authStore)
}

const Protected = withAuthRequired(ProtectedRoute, { returnTo: '/protected', useAuth })

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/protected',
        element: <Protected />,
      },
      {
        path: '/protected-by-loader',
        loader: protectedRouteLoader,
        element: <ProtectedByLoader />,
      },
      {
        path: '/auth0',
        element: <Invitation />,
        loader: invitationLoader,
      },
    ],
  },
])

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose())
}

function App() {
  const onRedirectCallback = (appState: any) => {
    // This is kind of a hack because the navigate method in the router object is private and not intended for public use.
    // Currently this is the only way to wrap the RouterProvider with the AuthProvider and have a custom onRedirectCallback
    router.navigate((appState && appState.returnTo) || window.location.pathname, { replace: true })
  }

  return (
    <AuthProvider onRedirectCallback={onRedirectCallback} authStore={authStore}>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
