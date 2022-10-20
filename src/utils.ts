import { OAuthError } from './errors'
import { type CamelCasedProperties } from './types'

const normalizeErrorFn =
  (fallbackMessage: string) =>
  (error: Error | { error: string; error_description?: string } | ProgressEvent): Error => {
    if ('error' in error) {
      return new OAuthError(error.error, error.error_description)
    }
    if (error instanceof Error) {
      return error
    }
    return new Error(fallbackMessage)
  }

export const tokenError = normalizeErrorFn('Get access token failed')

// For now we default to return the user to the root route after handling the redirect. At some point we could make it customizable.
export const defaultReturnTo = '/'

export const snakeToCamelCase = (str: string): string =>
  str.replace(/([-_][a-z0-9])/gi, $1 => $1.toUpperCase().replace('_', ''))

/**
 * Transform all object keys to camelCase including nested objects and arrays
 */
export function transformSnakeObjectKeysToCamel<INPUT extends {}>(
  data: INPUT,
): CamelCasedProperties<INPUT> {
  return Object.fromEntries(
    Object.entries(data).map(([key, val]) => [snakeToCamelCase(key), processVal(val)]),
  ) as CamelCasedProperties<INPUT>
}

/** Utility function to transform recursively the value in the object */
function processVal(val: unknown): unknown {
  return typeof val !== 'object' || val === null
    ? val
    : Array.isArray(val)
    ? val.map(processVal)
    : transformSnakeObjectKeysToCamel(val)
}
