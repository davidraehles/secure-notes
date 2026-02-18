import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Login } from '../Login';
import { loginIntent, registerIntent } from '../../intents/authIntents';
import { useDispatch } from 'react-redux';

// Mock react-redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

// Mock intents
vi.mock('../../intents/authIntents', () => ({
  loginIntent: vi.fn(),
  registerIntent: vi.fn(),
}));

describe('Login Component', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDispatch as any).mockReturnValue(mockDispatch);

    // Default mock implementation for unwrap
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(),
    });
  });

  it('renders login form by default', () => {
    render(<Login />);

    expect(screen.getByText('Secure Notes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Need an account? Register')).toBeInTheDocument();
  });

  it('switches to register mode when "Need an account? Register" is clicked', () => {
    render(<Login />);

    const switchButton = screen.getByText('Need an account? Register');
    fireEvent.click(switchButton);

    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByText('Have an account? Login')).toBeInTheDocument();
  });

  it('switches back to login mode when "Have an account? Login" is clicked', () => {
    render(<Login />);

    // Switch to Register
    fireEvent.click(screen.getByText('Need an account? Register'));

    // Switch back to Login
    fireEvent.click(screen.getByText('Have an account? Login'));

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Need an account? Register')).toBeInTheDocument();
  });

  it('updates email and password inputs', () => {
    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls loginIntent on successful login', async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginIntent).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it('calls registerIntent on successful registration', async () => {
    render(<Login />);

    // Switch to Register
    fireEvent.click(screen.getByText('Need an account? Register'));

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'newpassword' } });

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(registerIntent).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'newpassword',
      });
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it('displays error message on login failure', async () => {
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Invalid credentials')),
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('displays error message on registration failure', async () => {
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Email already exists')),
    });

    render(<Login />);

    // Switch to Register
    fireEvent.click(screen.getByText('Need an account? Register'));

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('disables inputs and button when loading', async () => {
    // Mock a slow dispatch
    let resolvePromise: (value: unknown) => void;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockDispatch.mockReturnValue({
      unwrap: () => slowPromise,
    });

    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Login' }) as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);

    // Resolve the promise to finish the test cleanly
    await act(async () => {
      resolvePromise!({});
      await slowPromise;
    });
  });
});
