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
  authorize: () => authorize,
  createAuthHook: () => import_zustand2.default,
  createAuthStore: () => createAuthStore,
  handleRedirectCallback: () => handleRedirectCallback
});
module.exports = __toCommonJS(src_exports);

// src/authStore.ts
var import_auth0_spa_js = require("@auth0/auth0-spa-js");
var import_zustand = require("zustand");

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
var defaultReturnTo = "/";
var snakeToCamelCase = (str) => str.replace(/([-_][a-z0-9])/gi, ($1) => $1.toUpperCase().replace("_", ""));
function transformSnakeObjectKeysToCamel(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, val]) => [snakeToCamelCase(key), processVal(val)])
  );
}
function processVal(val) {
  return typeof val !== "object" || val === null ? val : Array.isArray(val) ? val.map(processVal) : transformSnakeObjectKeysToCamel(val);
}

// src/authStore.ts
var createAuthStore = (options) => (0, import_zustand.createStore)()((set, get) => ({
  isLoading: true,
  isAuthenticated: false,
  auth0Client: new import_auth0_spa_js.Auth0Client(options),
  initialised: (user) => set((state) => ({
    ...state,
    isAuthenticated: !!user,
    user: user ? transformSnakeObjectKeysToCamel(user) : user,
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
      const auth0User = await auth0Client.getUser();
      if (auth0User) {
        const user = transformSnakeObjectKeysToCamel(auth0User);
        set(
          (state) => state.user?.updatedAt === user.updatedAt ? state : { ...state, isAuthenticated: !!user, user }
        );
      }
    }
    return token;
  },
  getIdTokenClaims: () => {
    const { auth0Client } = get();
    return auth0Client.getIdTokenClaims();
  }
}));

// src/loaderPolicyFunctions.ts
var authorize = async (authStore, callback) => {
  const { user, loginWithRedirect, auth0Client, initialised } = authStore.getState();
  try {
    if (user)
      return await callback({ user });
    await auth0Client.checkSession();
    const auth0User = await auth0Client.getUser();
    if (!auth0User)
      throw new Error("Unauthorized");
    initialised(auth0User);
    return await callback({ user: transformSnakeObjectKeysToCamel(auth0User) });
  } catch (error) {
    return await loginWithRedirect({
      appState: { returnTo: defaultReturnTo },
      onRedirect: async (url) => {
        window.location.replace(url);
        return new Promise((resolve) => {
          setTimeout(resolve, 1e3);
        });
      }
    });
  }
};
var handleRedirectCallback = async (authStore, callBack) => {
  const { auth0Client, initialised } = authStore.getState();
  const { appState } = await auth0Client.handleRedirectCallback();
  const auth0User = await auth0Client.getUser();
  initialised(auth0User);
  return callBack({ appState });
};

// src/index.ts
var import_zustand2 = __toESM(require("zustand"));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authorize,
  createAuthHook,
  createAuthStore,
  handleRedirectCallback
});
//# sourceMappingURL=index.js.map