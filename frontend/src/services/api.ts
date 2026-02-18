/**
 * API client for backend communication
 */

import type { EncryptedNote, LoginCredentials, RegisterCredentials, User } from '../models/types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_URL environment variable is not defined');
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Notes endpoints
  async getNotes(): Promise<EncryptedNote[]> {
    return this.request<EncryptedNote[]>('/api/notes');
  }

  async createNote(encryptedNote: Omit<EncryptedNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<EncryptedNote> {
    return this.request<EncryptedNote>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(encryptedNote),
    });
  }

  async updateNote(id: string, encryptedNote: Partial<EncryptedNote>): Promise<EncryptedNote> {
    return this.request<EncryptedNote>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(encryptedNote),
    });
  }

  async deleteNote(id: string): Promise<void> {
    return this.request<void>(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

