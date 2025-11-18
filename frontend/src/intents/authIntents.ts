/**
 * Auth intents - MVI Intent layer for authentication
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../services/api';
import { hashPassword } from '../services/encryption';
import type { LoginCredentials, RegisterCredentials } from '../models/types';
import { setAuth, clearAuth } from '../store/slices/authSlice';

export const registerIntent = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { dispatch, rejectWithValue }) => {
    try {
      // Hash password client-side for verification
      const passwordHash = await hashPassword(credentials.password);
      
      // Register with backend (backend will hash again for storage)
      const result = await apiClient.register({
        email: credentials.email,
        password: credentials.password, // Send plain password, backend hashes it
      });

      apiClient.setToken(result.token);
      dispatch(setAuth(result));
      
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }
);

export const loginIntent = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const result = await apiClient.login(credentials);
      
      apiClient.setToken(result.token);
      dispatch(setAuth(result));
      
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }
);

export const logoutIntent = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    apiClient.setToken(null);
    dispatch(clearAuth());
  }
);

