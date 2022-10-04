import './App.css'

import { AuthProvider, loaderWithAuth, withAuthRequired } from '@gigapipe/auth0-react'

import { createBrowserRouter, json, LoaderFunctionArgs, RouterProvider } from 'react-router-dom'
import { mountStoreDevtool } from 'simple-zustand-devtools'

import { authStore } from './auth'
import Home from './Home'
import ProtectedByLoader from './ProtectedByLoader'
import ProtectedRoute from './ProtectedRoute'
import Root from './Root'
import Invitation from './Invitation'

if (import.meta.env.DEV) {
  mountStoreDevtool('AuthStore', authStore)
}

const Protected = withAuthRequired(ProtectedRoute, { returnTo: '/protected', authStore })

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
        loader: async ({ request }: LoaderFunctionArgs) => {
          const returnTo = new URL(request.url).pathname
          console.log('Before checking auth')
          // TODO: solve the issue of the loader execunting completly while the loginWithRedirect is happening. Maybe using pop-up for this scenarios?
          await loaderWithAuth({ authStore, returnTo })
          console.log('After checking auth')

          return json('PAAAAAAAAAA')
        },
        element: <ProtectedByLoader />,
      },
      {
        path: '/invitation',
        element: <Invitation />,
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
    router.navigate((appState && appState.returnTo) || window.location.pathname)
  }

  return (
    <AuthProvider onRedirectCallback={onRedirectCallback} authStore={authStore}>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
