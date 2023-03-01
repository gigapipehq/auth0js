import { User, Auth0ClientOptions, Auth0Client, RedirectLoginOptions, LogoutOptions, GetTokenSilentlyOptions, IdToken } from '@auth0/auth0-spa-js';
export { CacheLocation, Cacheable, GetTokenSilentlyOptions, GetTokenWithPopupOptions, ICache, IdToken, InMemoryCache, LocalStorageCache, LogoutOptions, LogoutUrlOptions, PopupConfigOptions, PopupLoginOptions } from '@auth0/auth0-spa-js';
import { StoreApi } from 'zustand';

/**
 * The state of the application before the user was redirected to the login page.
 */
interface AppState {
    returnTo?: string;
    isOrganizationLogin?: boolean;
    isInviteLogin?: boolean;
    [key: string]: any;
}
/**
 * Custom utility type to convert snake_cased strings to camelCased
 */
type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<SnakeToCamelCase<U>>}` : S;
/**
 * Custom type utility to create a derived type by transforming all INPUT keys to camelCase, including nested objects, arrays and sets
 */
type CamelCasedProperties<INPUT> = INPUT extends Function ? INPUT : INPUT extends Array<infer U> ? Array<CamelCasedProperties<U>> : INPUT extends Set<infer U> ? Set<CamelCasedProperties<U>> : {
    [K in keyof INPUT as SnakeToCamelCase<K>]: CamelCasedProperties<INPUT[K]>;
};
/**
 * User object type from Auth0 SDK converted to camelCase notation
 */
type Auth0User = CamelCasedProperties<User>;

interface AuthState<TUser extends Auth0User = Auth0User> {
    /**
     * Auth0 SDK for SPAs
     */
    auth0Client: Auth0Client;
    isLoading: boolean;
    /**
     * Flag to indicate if the user is authenticated
     */
    isAuthenticated: boolean;
    /**
     * Any error saved in the store while interacting with Auth0
     */
    error?: Error;
    /**
     * The user object
     *
     * You can provide it via a generic type or it will default to the User from the Auth0 SDK
     * @default Auth0User
     */
    user?: TUser;
    /**
     * Internal action DO NOT USE
     */
    _actions: {
        initialised: (user?: TUser) => void;
    };
    /**
     * All available actions to interact with Auth0
     */
    actions: {
        /**
         * ```js
         * await loginWithRedirect(options);
         * ```
         *
         * Performs a redirect to the `/authorize` route in Auth0 using the parameters provided as arguments.
         *
         * @param options
         */
        loginWithRedirect: (loginOptions?: RedirectLoginOptions) => Promise<null>;
        /**
         * ```js
         * await logout(options);
         * ```
         *
         * Clears the application session and performs a redirect to the login route defind in Auth0
         *
         * */
        logout: (logoutOptions?: LogoutOptions) => Promise<null>;
        /**
         * ```js
         * const accessToken = await getAccessTokenSilently(options);
         * ```
         *
         * Fetches a new access token and return it
         * It also uses it to get an updated user and save it in the store
         */
        getAccessTokenSilently: (getTokenOptions?: GetTokenSilentlyOptions) => Promise<string>;
        /**
         * ```js
         * const claims = await getIdTokenClaims();
         * ```
         *
         * Returns all claims from the id_token if available.
         */
        getIdTokenClaims: () => Promise<IdToken | undefined>;
        /**
         * ```js
         * const user =  await updateUser({ givenName: 'Alfredo' });
         * const user =  await updateUser({ givenName: 'Alfredo' }, { fetchNewToken: true });
         * ```
         *
         * A function to update the user in the store or force a fetching of the information from Auth0
         */
        updateUser: (user: Partial<TUser>, options?: {
            fetchNewToken?: boolean;
        }) => Promise<TUser | undefined>;
    };
}
/**
 *  Function factory to create the Zustand store that contains all the state and the different auth methods.
 *  Use this store outside the React tree (ie. `const { isAuthenticated, loginWithRedirect } = authStore.getState()`) or if you only need access to its methods.
 * ```js
 * const authStore = createAuthStore<CustomUserType>({
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
 * Then you can use the `useStore` hook from Zustand to create the custom hooks (see example).
 * ```js
 * const useUser = useStore(authStore, state => state.user)
 * ```
 * Accepts an optional generic to customize the type for the user object. Use it only if you have extended the IDToken in Auth0 or you use the organizations feature
 *
 * ```ts
 *  interface CustomUserType extends Auth0User {
 *    connection: string
 *    orgId?: string
 *  }
 * ```
 */
declare const createAuthStore: <TUser extends {
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
} = {
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
}>(options: Auth0ClientOptions) => StoreApi<AuthState<TUser>>;
type AuthStore<TUser extends Auth0User> = StoreApi<AuthState<TUser>>;

/**
 * This is a policy function used to authorize a request in a loader function from react-router
 * @param authStore
 * @param callback
 * @param returnTo
 *
 * @example
 * ```js
 *  async function loader({ request }) {
 *      return authorize(
 *        authStore,
 *        async ({ user }) => {
 *          // here we can get the data for this route and return it.
 *        },
 *        '/welcome'
 *    )
 *  }
 * ```
 */
declare const authorize: <TUser extends {
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
} = {
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
}>(authStore: AuthStore<TUser>, callback: (input: {
    user: TUser;
}) => Promise<Response>, returnTo?: string) => Promise<Response | null>;
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
declare const handleRedirectCallback: <TUser extends {
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
} = {
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
}>(authStore: AuthStore<TUser>, callback: (input: {
    appState?: AppState;
}) => Promise<Response>) => Promise<Response>;

export { Auth0User, authorize, createAuthStore, handleRedirectCallback };
