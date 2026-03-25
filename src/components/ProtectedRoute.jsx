import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{
          width: '36px', height: '36px',
          border: '3px solid #e0dbd3',
          borderTopColor: '#c0392b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) {
    // Redirect to login, but remember where user wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
