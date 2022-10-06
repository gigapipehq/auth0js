// src/AuthProvider.tsx
import { useEffect, useRef } from "react";

// src/errors.ts
var OAuthError = class extends Error {
  constructor(error, error_description) {
    super(error_description || error);
    this.error = error;
    this.error_description = error_description;
    Object.setPrototypeOf(this, OAuthError.prototype);
  }
};

// src/utils.ts
var CODE_RE = /[?&]code=[^&]+/;
var STATE_RE = /[?&]state=[^&]+/;
var ERROR_RE = /[?&]error=[^&]+/;
var hasAuthParams = (searchParams = window.location.search) => (CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) && STATE_RE.test(searchParams);
var normalizeErrorFn = (fallbackMessage) => (error) => {
  if ("error" in error) {
    return new OAuthError(error.error, error.error_description);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
};
var tokenError = normalizeErrorFn("Get access token failed");
var defaultReturnTo = () => `${window.location.pathname}${window.location.search}`;

// src/AuthProvider.tsx
import { Fragment, jsx } from "react/jsx-runtime";
var defaultOnRedirectCallback = (appState) => {
  window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname);
};
var AuthProvider = (opts) => {
  const {
    children,
    skipRedirectCallback,
    onRedirectCallback = defaultOnRedirectCallback,
    authStore
  } = opts;
  const { auth0Client, initialised, setError } = authStore.getState();
  const didInitialise = useRef(false);
  useEffect(() => {
    if (didInitialise.current) {
      return;
    }
    didInitialise.current = true;
    (async () => {
      try {
        let user;
        if (hasAuthParams() && !skipRedirectCallback) {
          const { appState } = await auth0Client.handleRedirectCallback();
          user = await auth0Client.getUser();
          initialised(user);
          onRedirectCallback(appState, user);
        } else {
          await auth0Client.checkSession();
          user = await auth0Client.getUser();
          initialised(user);
        }
      } catch (error) {
        setError(error);
      }
    })();
  }, [auth0Client, initialised, onRedirectCallback, setError, skipRedirectCallback]);
  return /* @__PURE__ */ jsx(Fragment, {
    children
  });
};
var AuthProvider_default = AuthProvider;

// src/authStore.ts
import {
  Auth0Client
} from "@auth0/auth0-spa-js";
import { createStore } from "zustand";
var createAuthStore = (options) => createStore()((set, get) => ({
  isLoading: true,
  isAuthenticated: false,
  auth0Client: new Auth0Client(options),
  initialised: (user) => set((state) => ({
    ...state,
    isAuthenticated: !!user,
    user,
    isLoading: false,
    error: void 0
  })),
  setError: (error) => set((state) => ({ ...state, isLoading: false, error })),
  loginWithRedirect: (loginOptions) => {
    const { auth0Client } = get();
    return auth0Client.loginWithRedirect(loginOptions);
  },
  logout: (logoutOptions) => {
    const { auth0Client } = get();
    return auth0Client.logout(logoutOptions);
  },
  getAccessTokenSilently: async (getTokenOptions) => {
    const { auth0Client } = get();
    let token;
    try {
      token = await auth0Client.getTokenSilently(getTokenOptions);
    } catch (error) {
      throw tokenError(error);
    } finally {
      const user = await auth0Client.getUser();
      set(
        (state) => state.user?.updated_at === user?.updated_at ? state : { ...state, isAuthenticated: !!user, user }
      );
    }
    return token;
  },
  getIdTokenClaims: () => {
    const { auth0Client } = get();
    return auth0Client.getIdTokenClaims();
  }
}));

// src/withAuthRequired.tsx
import { useEffect as useEffect2 } from "react";
import { Fragment as Fragment2, jsx as jsx2 } from "react/jsx-runtime";
var defaultOnRedirecting = () => /* @__PURE__ */ jsx2(Fragment2, {
  children: "Redirecting..."
});
var withAuthRequired = (Component, options) => function WithAuthenticationRequired(props) {
  const {
    useAuth,
    loginOptions,
    returnTo = defaultReturnTo,
    onRedirecting = defaultOnRedirecting,
    claimCheck = () => true
  } = options;
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const isLoading = useAuth((state) => state.isLoading);
  const user = useAuth((state) => state.user);
  const loginWithRedirect = useAuth((state) => state.loginWithRedirect);
  const routeIsAuthenticated = isAuthenticated && claimCheck(user);
  useEffect2(() => {
    if (isLoading || routeIsAuthenticated) {
      return;
    }
    const opts = {
      ...loginOptions,
      appState: {
        ...loginOptions && loginOptions.appState,
        returnTo: typeof returnTo === "function" ? returnTo() : returnTo
      }
    };
    (async () => {
      await loginWithRedirect(opts);
    })();
  }, [isLoading, routeIsAuthenticated, loginWithRedirect, loginOptions, returnTo]);
  return routeIsAuthenticated ? /* @__PURE__ */ jsx2(Component, {
    ...props
  }) : onRedirecting();
};
var withAuthRequired_default = withAuthRequired;

// src/index.ts
import { default as default2 } from "zustand";
export {
  AuthProvider_default as AuthProvider,
  default2 as createAuthHook,
  createAuthStore,
  withAuthRequired_default as withAuthRequired
};
//# sourceMappingURL=index.mjs.map