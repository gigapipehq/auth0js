import './App.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { mountStoreDevtool } from 'simple-zustand-devtools'

import { authStore } from './auth'
import Auth, { loader as authLoader } from './pages/Auth'
import Home from './pages/Home'
import ProtectedByLoader, { loader as protectedRouteLoader } from './pages/ProtectedByLoader'
import Root from './pages/Root'

if (import.meta.env.DEV) {
  mountStoreDevtool('AuthStore', authStore)
}

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <Auth />,
    loader: authLoader,
  },
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
        loader: protectedRouteLoader,
        element: <ProtectedByLoader />,
      },
    ],
  },
])

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose())
}

function App() {
  return <RouterProvider router={router} />
}

export default App
