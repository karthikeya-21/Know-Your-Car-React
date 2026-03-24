import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        </nav>
      </div>
    </header>
  );
}
