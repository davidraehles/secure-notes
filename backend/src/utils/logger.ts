/**
 * Centralized logger utility wrapping console methods
 */

export const info = (message: string, ...args: unknown[]) => {
  console.log(message, ...args);
};

export const error = (message: string, ...args: unknown[]) => {
  console.error(message, ...args);
};

export const warn = (message: string, ...args: unknown[]) => {
  console.warn(message, ...args);
};

export const debug = (message: string, ...args: unknown[]) => {
  console.debug(message, ...args);
};

export default {
  info,
  error,
  warn,
  debug,
};
