import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await login(username, password);
      setAuth(token, user.username);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>💍 Wedding Scanner</h1>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus autoComplete="username" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
