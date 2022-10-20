import { type LoaderFunctionArgs, json, useLoaderData } from 'react-router-dom'
import { authStore } from '../auth'
import { authorize } from '@gigapipe/auth0js'

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('Request object: ', request)

  return authorize(authStore, async ({ user }) => {
    console.log('This is your information: ', user)
    return json('Welcome!', { status: 200 })
  })
}

export default function ProtectedByLoader() {
  const loaderData = useLoaderData()

  return (
    <div>
      {`${loaderData} This route is protected by its loader, you will never see this unless you are
      authenticated`}
    </div>
  )
}
