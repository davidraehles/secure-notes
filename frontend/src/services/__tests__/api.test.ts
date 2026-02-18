/**
 * Integration tests for API client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../api';

// Mock fetch
globalThis.fetch = vi.fn() as unknown as typeof fetch;

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.setToken(null);
    localStorage.clear();
  });

  it('should include token in authenticated requests', async () => {
    const token = 'test-token';
    apiClient.setToken(token);
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', encryptedContent: 'encrypted' }),
    } as Response);

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

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

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

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

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

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

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
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' }),
    } as Response);

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
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as unknown as Response);

    await expect(apiClient.getNotes()).rejects.toThrow();
  });
});

