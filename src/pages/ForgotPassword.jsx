import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../firebase/services';
import './Auth.css';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(`An email has been sent to ${email} with instructions to reset your password.`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No user with given email.');
      } else {
        setError('Failed to send reset email. Please try again.');
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
          <h1 className="auth-card__title">Forgot Password</h1>
          <p className="auth-card__sub">Enter your email to reset your password</p>
        </div>

        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-switch">
          Remembered it? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
