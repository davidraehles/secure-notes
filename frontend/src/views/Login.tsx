/**
 * Login/Register view - MVI View layer
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerIntent, loginIntent } from '../intents/authIntents';
import type { AppDispatch } from '../store/store';

export function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await dispatch(loginIntent({ email, password })).unwrap();
      } else {
        await dispatch(registerIntent({ email, password })).unwrap();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Secure Notes</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => {
          setIsLogin(!isLogin);
          setError(null);
        }}
        disabled={loading}
      >
        {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </div>
  );
}

