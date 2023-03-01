import { type User } from '@auth0/auth0-spa-js'

/**
 * The state of the application before the user was redirected to the login page.
 */
export interface AppState {
  returnTo?: string
  isOrganizationLogin?: boolean
  isInviteLogin?: boolean
  [key: string]: any
}

/**
 * Custom type utility to convert camelCased strings to snake_cased
 */
export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S

/**
 * Custom type utility to create a derived type by transforming all INPUT keys to snake_case, including nested objects, arrays and sets
 */
export type SnakeCasedProperties<INPUT> = INPUT extends Function
  ? INPUT
  : INPUT extends Array<infer U>
  ? Array<SnakeCasedProperties<U>>
  : INPUT extends Set<infer U>
  ? Set<SnakeCasedProperties<U>>
  : // @ts-expect-error
    { [K in keyof INPUT as CamelToSnakeCase<K>]: SnakeCasedProperties<INPUT[K]> }

/**
 * Custom utility type to convert snake_cased strings to camelCased
 */
export type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S

/**
 * Custom type utility to create a derived type by transforming all INPUT keys to camelCase, including nested objects, arrays and sets
 */
export type CamelCasedProperties<INPUT> = INPUT extends Function
  ? INPUT
  : INPUT extends Array<infer U>
  ? Array<CamelCasedProperties<U>>
  : INPUT extends Set<infer U>
  ? Set<CamelCasedProperties<U>>
  : // @ts-expect-error
    { [K in keyof INPUT as SnakeToCamelCase<K>]: CamelCasedProperties<INPUT[K]> }

/**
 * User object type from Auth0 SDK converted to camelCase notation
 */
export type Auth0User = CamelCasedProperties<User>
