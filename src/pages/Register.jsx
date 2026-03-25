import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

// Mirror Flutter's validation
function isEmailValid(email) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

function isPasswordValid(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_=+])[A-Za-z\d!@#$%^&*()-_=+]{8,}$/.test(password);
}

export default function Register() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEmailValid(email))       return setError('Invalid email address.');
    if (!isPasswordValid(password)) return setError('Password must be at least 8 characters and contain a letter, number, and special character.');
    if (password !== password2)     return setError('Passwords do not match.');

    setLoading(true);
    try {
      await register(email, password);
      navigate('/profile');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-card__logo">KYC</span>
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__sub">Join Know Your Car</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password"
              placeholder="Min 8 chars, 1 number, 1 special char"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password2">Confirm Password</label>
            <input
              id="password2" type="password" placeholder="••••••••"
              value={password2} onChange={(e) => setPassword2(e.target.value)}
              required autoComplete="new-password"
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
