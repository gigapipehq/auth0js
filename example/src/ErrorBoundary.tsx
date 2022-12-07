import { useRouteError } from 'react-router-dom'

export function ErrorBoundary() {
  const routeError = useRouteError() as Error
  console.log('🚀 ~ file: ErrorBoundary.tsx:6 ~ ErrorBoundary ~ routeError', routeError)

  return <div>Error!</div>
}
