import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist } from '../firebase/services';
import './Profile.css';

function WishlistCard({ car, uid, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeFromWishlist(uid, car.firestoreId);
      onRemove(car.firestoreId);
    } catch (err) {
      console.error(err);
      setRemoving(false);
    }
  };

  // Support both Flutter field names (Image / specificatios) and new ones
  const imageUrl = car.Image || car.image || '/placeholder.png';
  const carName  = car.name;
  const carBrand = car.brand;
  const carPrice = car.price;

  return (
    <div className="fav-card">
      <Link to={`/car/${encodeURIComponent(carName)}`} className="fav-card__image-wrap">
        <img src={imageUrl} alt={carName} className="fav-card__image" />
      </Link>
      <div className="fav-card__body">
        <div>
          <p className="fav-card__brand">{carBrand}</p>
          <h3 className="fav-card__name">{carName}</h3>
          <p className="fav-card__price">₹{Number(carPrice).toLocaleString('en-IN')}</p>
        </div>
        <button
          className="fav-card__remove"
          onClick={handleRemove}
          disabled={removing}
          aria-label={`Remove ${carName} from wishlist`}
        >
          {removing ? '…' : '✕'}
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, profile, logout }          = useAuth();
  const navigate                           = useNavigate();
  const [wishlist,    setWishlist]         = useState([]);
  const [wishLoading, setWishLoading]      = useState(true);

  useEffect(() => {
    if (!user) return;
    getWishlist(user.uid)
      .then(setWishlist)
      .catch(console.error)
      .finally(() => setWishLoading(false));
  }, [user]);

  const handleRemove = (firestoreId) => {
    setWishlist((prev) => prev.filter((c) => c.firestoreId !== firestoreId));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Profile data from Realtime Database
  const profileData = profile?.data || {};
  const displayName = profileData.name  || '';
  const bio         = profileData.bio   || '';
  const photoUrl    = profileData.image || '';

  return (
    <div className="profile-page">

      {/* ── Hero ── */}
      <section className="profile-hero">
        <div className="profile-hero__inner">
          <div className="profile-hero__avatar">
            {photoUrl
              ? <img src={photoUrl} alt="avatar" />
              : <span>{(user?.email || 'U')[0].toUpperCase()}</span>
            }
          </div>
          <div className="profile-hero__info">
            <h1 className="profile-hero__name">
              {displayName || user?.email}
            </h1>
            {bio && <p className="profile-hero__bio">{bio}</p>}
            <p className="profile-hero__email">{user?.email}</p>
            <div className="profile-hero__actions">
              <Link to="/profile/edit" className="profile-btn profile-btn--primary">
                Edit Profile
              </Link>
              <button className="profile-btn profile-btn--ghost" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Wishlist ── */}
      <section className="profile-section">
        <div className="profile-section__inner">
          <div className="profile-section__header">
            <h2 className="profile-section__title">Wishlist</h2>
            <span className="profile-section__count">
              {wishlist.length} {wishlist.length === 1 ? 'car' : 'cars'}
            </span>
          </div>

          {wishLoading && (
            <div className="fav-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="fav-skeleton">
                  <div className="skeleton fav-skeleton__image" />
                  <div className="fav-skeleton__body">
                    <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                    <div className="skeleton" style={{ height: '20px', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!wishLoading && wishlist.length === 0 && (
            <div className="fav-empty">
              <span className="fav-empty__icon">🚗</span>
              <p>No cars in your wishlist yet.</p>
              <Link to="/" className="profile-btn profile-btn--primary">Explore Cars</Link>
            </div>
          )}

          {!wishLoading && wishlist.length > 0 && (
            <div className="fav-grid">
              {wishlist.map((car) => (
                <WishlistCard
                  key={car.firestoreId}
                  car={car}
                  uid={user.uid}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
