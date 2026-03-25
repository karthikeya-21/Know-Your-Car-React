import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo">
          <span className="navbar__logo-mark">KYC</span>
          <span className="navbar__logo-text">Know Your Car</span>
        </NavLink>

        <nav className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'navbar__link active' : 'navbar__link'}>
            Explore
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'navbar__link active' : 'navbar__link'}>
            About
          </NavLink>

          {user ? (
            <div className="navbar__user">
              <NavLink to="/profile" className="navbar__avatar" title={user.email}>
                {user.photoUrl
                  ? <img src={user.photoUrl} alt="avatar" />
                  : <span>{user.email[0].toUpperCase()}</span>
                }
              </NavLink>
              <button className="navbar__logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <NavLink to="/login" className="navbar__link navbar__link--cta">
              Sign In
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
