/**
 * Centralized logger utility
 */

export const info = (...args: unknown[]) => {
  console.log(...args);
};

export const error = (...args: unknown[]) => {
  console.error(...args);
};

export const warn = (...args: unknown[]) => {
  console.warn(...args);
};

export const debug = (...args: unknown[]) => {
  console.debug(...args);
};
