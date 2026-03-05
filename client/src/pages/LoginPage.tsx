import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      setAuth(token, user);
      navigate('/dashboard');
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
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
