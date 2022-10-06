import { Auth0ClientOptions, User, Auth0Client, RedirectLoginOptions, LogoutOptions, GetTokenSilentlyOptions, IdToken } from '@auth0/auth0-spa-js';
export { CacheLocation, Cacheable, GetTokenSilentlyOptions, GetTokenWithPopupOptions, ICache, IdToken, InMemoryCache, LocalStorageCache, LogoutOptions, LogoutUrlOptions, PopupConfigOptions, PopupLoginOptions, User } from '@auth0/auth0-spa-js';
import { ReactNode, ComponentType } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
export { default as createAuthHook } from 'zustand';

declare type AuthState<TUser extends User = User> = {
    auth0Client: Auth0Client;
    isLoading: boolean;
    isAuthenticated: boolean;
    error?: Error;
    user?: TUser;
    initialised: (user?: User) => void;
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
declare const createAuthStore: (options: Auth0ClientOptions) => StoreApi<AuthState<User>>;
declare type AuthStore = ReturnType<typeof createAuthStore>;
declare type UseAuthHook = UseBoundStore<StoreApi<AuthState>>;

/**
 * The state of the application before the user was redirected to the login page.
 */
declare type AppState = {
    returnTo?: string;
    [key: string]: any;
};

declare type AuthProviderOptions = {
    children: ReactNode;
    /**
     * By default this removes the code and state parameters from the url when you are redirected from the authorize page.
     * It uses `window.history` but you might want to overwrite this if you are using a custom router, like `react-router-dom`
     * See the example folder.
     */
    onRedirectCallback?: (appState?: AppState, user?: User) => void;
    /**
     * By default, if the page url has code/state params, the SDK will treat them as Auth0's and attempt to exchange the
     * code for a token. In some cases the code might be for something else (another OAuth SDK perhaps). In these
     * instances you can instruct the client to ignore them eg
     *
     * ```jsx
     * <AuthProvider
     *   clientId={clientId}
     *   domain={domain}
     *   skipRedirectCallback={window.location.pathname === '/stripe-oauth-callback'}
     * >
     * ```
     */
    skipRedirectCallback?: boolean;
    /**
     * Zustand store that contains all the state and the different auth methods. Created with `createAuthStore`
     *
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
     */
    authStore: AuthStore;
};
declare const AuthProvider: (opts: AuthProviderOptions) => JSX.Element;

/**
 * Options for the withAuthenticationRequired Higher Order Component
 */
interface WithAuthenticationRequiredOptions {
    /**
     * ```js
     * withAuthenticationRequired(Profile, {
     *   returnTo: '/profile'
     * })
     * ```
     *
     * or
     *
     * ```js
     * withAuthenticationRequired(Profile, {
     *   returnTo: () => window.location.hash.substr(1)
     * })
     * ```
     *
     * Add a path for the `onRedirectCallback` handler to return the user to after login.
     */
    returnTo?: string | (() => string);
    /**
     * ```js
     * withAuthenticationRequired(Profile, {
     *   onRedirecting: () => <div>Redirecting you to the login...</div>
     * })
     * ```
     *
     * Render a message to show that the user is being redirected to the login.
     */
    onRedirecting?: () => JSX.Element;
    /**
     * ```js
     * withAuthenticationRequired(Profile, {
     *   loginOptions: {
     *     appState: {
     *       customProp: 'foo'
     *     }
     *   }
     * })
     * ```
     *
     * Pass additional login options, like extra `appState` to the login page.
     * This will be merged with the `returnTo` option used by the `onRedirectCallback` handler.
     */
    loginOptions?: RedirectLoginOptions;
    /**
     * Check the user object for JWT claims and return a boolean indicating
     * whether or not they are authorized to view the component.
     */
    claimCheck?: (claims?: User) => boolean;
    /**
     * Zustand hook that give us reactive access to all the state and the different auth methods. Created with `createAuthHook`
     *
     * ```js
     * const useAuth = createAuthHook(authStore)
     * ```
     */
    useAuth: UseAuthHook;
}
/**
 * ```js
 * const MyProtectedComponent = withAuthenticationRequired(MyComponent);
 * ```
 *
 * When you wrap your components in this Higher Order Component and an anonymous user visits your component
 * they will be redirected to the login page and returned to the page they we're redirected from after login.
 */
declare const withAuthRequired: <P extends object>(Component: ComponentType<P>, options: WithAuthenticationRequiredOptions) => (props: P) => JSX.Element;

export { AuthProvider, createAuthStore, withAuthRequired };
