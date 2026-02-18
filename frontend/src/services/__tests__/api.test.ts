/**
 * Integration tests for API client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../api';

// Mock fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.setToken(null);
    localStorage.clear();
  });

  it('should include token in authenticated requests', async () => {
    const token = 'test-token';
    apiClient.setToken(token);
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', encryptedContent: 'encrypted' }),
    });

    await apiClient.getNotes();
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notes'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
        credentials: 'include',
      })
    );
  });

  it('should handle registration', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com' },
      token: 'test-token',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.register({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    );
  });

  it('should handle login', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com' },
      token: 'test-token',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockResponse);
  });

  it('should handle getMe', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com' },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.getMe();

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/me'),
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  it('should handle logout', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' }),
    });

    await apiClient.logout();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
  });

  it('should handle errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    await expect(apiClient.getNotes()).rejects.toThrow();
  });
});

