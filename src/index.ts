export { createAuthStore } from './authStore'
export { authorize, handleRedirectCallback } from './loaderPolicyFunctions'
export type { User } from './types'
export type {
  Cacheable,
  CacheLocation,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  ICache,
  IdToken,
  InMemoryCache,
  LocalStorageCache,
  LogoutOptions,
  LogoutUrlOptions,
  PopupConfigOptions,
  PopupLoginOptions,
} from '@auth0/auth0-spa-js'
