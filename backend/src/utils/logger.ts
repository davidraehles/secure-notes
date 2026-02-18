/**
 * Centralized logger utility wrapping console methods
 */

export const info = (message: string, ...args: any[]) => {
  console.log(message, ...args);
};

export const error = (message: string, ...args: any[]) => {
  console.error(message, ...args);
};

export const warn = (message: string, ...args: any[]) => {
  console.warn(message, ...args);
};

export const debug = (message: string, ...args: any[]) => {
  console.debug(message, ...args);
};

export default {
  info,
  error,
  warn,
  debug,
};
