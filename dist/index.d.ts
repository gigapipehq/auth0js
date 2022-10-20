import * as _auth0_auth0_spa_js from '@auth0/auth0-spa-js';
import { User as User$1, Auth0ClientOptions, Auth0Client, RedirectLoginOptions, LogoutOptions, GetTokenSilentlyOptions, IdToken } from '@auth0/auth0-spa-js';
export { CacheLocation, Cacheable, GetTokenSilentlyOptions, GetTokenWithPopupOptions, ICache, IdToken, InMemoryCache, LocalStorageCache, LogoutOptions, LogoutUrlOptions, PopupConfigOptions, PopupLoginOptions } from '@auth0/auth0-spa-js';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';
export { default as createAuthHook } from 'zustand';

/**
 * The state of the application before the user was redirected to the login page.
 */
declare type AppState = {
    returnTo?: string;
    isOrganizationLogin?: boolean;
    isInviteLogin?: boolean;
    [key: string]: any;
};
/**
 * Custom utility type to convert snake_cased strings to camelCased
 */
declare type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<SnakeToCamelCase<U>>}` : S;
/**
 * Custom type utility to create a derived type by transforming all INPUT keys to camelCase, including nested objects, arrays and sets
 */
declare type CamelCasedProperties<INPUT> = INPUT extends Function ? INPUT : INPUT extends Array<infer U> ? Array<CamelCasedProperties<U>> : INPUT extends Set<infer U> ? Set<CamelCasedProperties<U>> : {
    [K in keyof INPUT as SnakeToCamelCase<K>]: CamelCasedProperties<INPUT[K]>;
};
declare type User = CamelCasedProperties<User$1>;

declare type AuthState = {
    auth0Client: Auth0Client;
    isLoading: boolean;
    isAuthenticated: boolean;
    error?: Error;
    user?: User;
    initialised: (user?: User$1) => void;
    setError: (error: Error) => void;
    loginWithRedirect: (loginOptions?: RedirectLoginOptions) => Promise<void>;
    logout: (logoutOptions?: LogoutOptions) => Promise<void>;
    getAccessTokenSilently: (getTokenOptions?: GetTokenSilentlyOptions) => Promise<string>;
    getIdTokenClaims: () => Promise<IdToken | undefined>;
};
/**
 *  Function factory to create the Zustand store that contains all the state and the different auth methods.
 *  Use this store outside the React tree (ie. `const { isAuthenticated, loginWithRedirect } = authStore.getState()`) or if you only need access to its methods.
 * ```js
 * const authStore = createAuthStore({
 *  domain: import.meta.env.VITE_AUTH0_DOMAIN,
 *  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
 *  useRefreshTokens: true,
 *  authorizationParams: {
 *    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
 *    redirect_uri: window.location.origin,
 *  },
 * }
 * ```
 *
 * Then you can use the `createAuthHook` function to create a custom hook for easy access inside React components
 * ```js
 * const useAuth = createAuthHook(authStore)
 * ```
 */
declare const createAuthStore: (options: Auth0ClientOptions) => StoreApi<AuthState>;

/**
 * This is a policy function used to authorize a request in a loader function from react-router
 * @param authStore
 * @param callback
 *
 * @example
 * ```js
 *  async function loader({ request }) {
 *      return authorize(authStore, async ({ user }) => {
 *          // here we can get the data for this route and return it.
 *      })
 *  }
 * ```
 */
declare const authorize: <LoaderReturn = Response>(authStore: zustand.StoreApi<{
    auth0Client: _auth0_auth0_spa_js.Auth0Client;
    isLoading: boolean;
    isAuthenticated: boolean;
    error?: Error | undefined;
    user?: {
        [x: string]: any;
        name?: string | undefined;
        givenName?: string | undefined;
        familyName?: string | undefined;
        middleName?: string | undefined;
        nickname?: string | undefined;
        preferredUsername?: string | undefined;
        profile?: string | undefined;
        picture?: string | undefined;
        website?: string | undefined;
        email?: string | undefined;
        emailVerified?: boolean | undefined;
        gender?: string | undefined;
        birthdate?: string | undefined;
        zoneinfo?: string | undefined;
        locale?: string | undefined;
        phoneNumber?: string | undefined;
        phoneNumberVerified?: boolean | undefined;
        address?: string | undefined;
        updatedAt?: string | undefined;
        sub?: string | undefined;
    } | undefined;
    initialised: (user?: User$1 | undefined) => void;
    setError: (error: Error) => void;
    loginWithRedirect: (loginOptions?: _auth0_auth0_spa_js.RedirectLoginOptions<any> | undefined) => Promise<void>;
    logout: (logoutOptions?: _auth0_auth0_spa_js.LogoutOptions | undefined) => Promise<void>;
    getAccessTokenSilently: (getTokenOptions?: _auth0_auth0_spa_js.GetTokenSilentlyOptions | undefined) => Promise<string>;
    getIdTokenClaims: () => Promise<_auth0_auth0_spa_js.IdToken | undefined>;
}>, callback: (input: {
    user: User;
}) => Promise<LoaderReturn>) => Promise<void | LoaderReturn>;
/**
 * This is a policy function used to handle the redirection from Auth0
 * @param authStore
 * @param callback
 *
 * @example
 * ```js
 * // loader from route where Auth0 redirects users
 *  async function loader({ request }) {
 *      // handle other flows managed by the same route.
 *
 *      // handle default flow
 *      return handleRedirectCallback(authStore, async ({ appState }) => {
 *          return redirect(appState.returnTo)
 *      })
 *  }
 * ```
 */
declare const handleRedirectCallback: <LoaderReturn = Response>(authStore: zustand.StoreApi<{
    auth0Client: _auth0_auth0_spa_js.Auth0Client;
    isLoading: boolean;
    isAuthenticated: boolean;
    error?: Error | undefined;
    user?: {
        [x: string]: any;
        name?: string | undefined;
        givenName?: string | undefined;
        familyName?: string | undefined;
        middleName?: string | undefined;
        nickname?: string | undefined;
        preferredUsername?: string | undefined;
        profile?: string | undefined;
        picture?: string | undefined;
        website?: string | undefined;
        email?: string | undefined;
        emailVerified?: boolean | undefined;
        gender?: string | undefined;
        birthdate?: string | undefined;
        zoneinfo?: string | undefined;
        locale?: string | undefined;
        phoneNumber?: string | undefined;
        phoneNumberVerified?: boolean | undefined;
        address?: string | undefined;
        updatedAt?: string | undefined;
        sub?: string | undefined;
    } | undefined;
    initialised: (user?: User$1 | undefined) => void;
    setError: (error: Error) => void;
    loginWithRedirect: (loginOptions?: _auth0_auth0_spa_js.RedirectLoginOptions<any> | undefined) => Promise<void>;
    logout: (logoutOptions?: _auth0_auth0_spa_js.LogoutOptions | undefined) => Promise<void>;
    getAccessTokenSilently: (getTokenOptions?: _auth0_auth0_spa_js.GetTokenSilentlyOptions | undefined) => Promise<string>;
    getIdTokenClaims: () => Promise<_auth0_auth0_spa_js.IdToken | undefined>;
}>, callBack: (input: {
    appState?: AppState;
}) => Promise<LoaderReturn>) => Promise<LoaderReturn>;

export { User, authorize, createAuthStore, handleRedirectCallback };
