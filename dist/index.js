"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AuthProvider: () => AuthProvider_default,
  createAuthHook: () => import_zustand2.default,
  createAuthStore: () => createAuthStore,
  withAuthRequired: () => withAuthRequired_default
});
module.exports = __toCommonJS(src_exports);

// src/AuthProvider.tsx
var import_react = require("react");

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
var import_jsx_runtime = require("react/jsx-runtime");
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
  const didInitialise = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
    children
  });
};
var AuthProvider_default = AuthProvider;

// src/authStore.ts
var import_auth0_spa_js = require("@auth0/auth0-spa-js");
var import_zustand = require("zustand");
var createAuthStore = (options) => (0, import_zustand.createStore)()((set, get) => ({
  isLoading: true,
  isAuthenticated: false,
  auth0Client: new import_auth0_spa_js.Auth0Client(options),
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
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var defaultOnRedirecting = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, {
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
  (0, import_react2.useEffect)(() => {
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
  return routeIsAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Component, {
    ...props
  }) : onRedirecting();
};
var withAuthRequired_default = withAuthRequired;

// src/index.ts
var import_zustand2 = __toESM(require("zustand"));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthProvider,
  createAuthHook,
  createAuthStore,
  withAuthRequired
});
//# sourceMappingURL=index.js.map