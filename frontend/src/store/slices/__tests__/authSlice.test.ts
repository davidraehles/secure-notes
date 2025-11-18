/**
 * Unit tests for auth slice
 */

import { describe, it, expect } from 'vitest';
import authReducer, { setAuth, clearAuth } from '../authSlice';
import type { AuthState } from '../../../models/types';

describe('Auth Slice', () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should set auth state', () => {
    const user = { id: '1', email: 'test@example.com' };
    const token = 'test-token';
    
    const action = setAuth({ user, token });
    const state = authReducer(initialState, action);
    
    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear auth state', () => {
    const stateWithAuth: AuthState = {
      user: { id: '1', email: 'test@example.com' },
      token: 'test-token',
      isAuthenticated: true,
    };
    
    const action = clearAuth();
    const state = authReducer(stateWithAuth, action);
    
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

