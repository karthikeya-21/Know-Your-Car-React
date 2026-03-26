import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { removeFromWishlist } from '../firebase/services';
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

  const imageUrl = car.Image || car.image || '/placeholder.png';

  return (
    <div className="fav-card">
      <Link to={`/car/${encodeURIComponent(car.name)}`} className="fav-card__image-wrap">
        <img src={imageUrl} alt={car.name} className="fav-card__image" />
      </Link>
      <div className="fav-card__body">
        <div>
          <p className="fav-card__brand">{car.brand}</p>
          <h3 className="fav-card__name">{car.name}</h3>
          <p className="fav-card__price">₹{Number(car.price).toLocaleString('en-IN')}</p>
        </div>
        <button
          className="fav-card__remove"
          onClick={handleRemove}
          disabled={removing}
          aria-label={`Remove ${car.name} from wishlist`}
        >
          {removing ? '…' : '✕'}
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, profile, wishlist, logout, removeFromWishlistCache } = useAuth();
  const navigate = useNavigate();

  const handleRemove = (firestoreId) => {
    removeFromWishlistCache(firestoreId);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const profileData = profile?.data || {};
  const displayName = profileData.name  || '';
  const bio         = profileData.bio   || '';
  const photoUrl    = profileData.image || '';

  // wishlist is null while loading (first time), array once loaded
  const wishlistLoading = wishlist === null;

  return (
    <div className="profile-page">

      <section className="profile-hero">
        <div className="profile-hero__inner">
          <div className="profile-hero__avatar">
            {photoUrl
              ? <img src={photoUrl} alt="avatar" />
              : <span>{(user?.email || 'U')[0].toUpperCase()}</span>
            }
          </div>
          <div className="profile-hero__info">
            <h1 className="profile-hero__name">{displayName || user?.email}</h1>
            {bio && <p className="profile-hero__bio">{bio}</p>}
            <p className="profile-hero__email">{user?.email}</p>
            <div className="profile-hero__actions">
              <Link to="/profile/edit" className="profile-btn profile-btn--primary">Edit Profile</Link>
              <button className="profile-btn profile-btn--ghost" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section__inner">
          <div className="profile-section__header">
            <h2 className="profile-section__title">Wishlist</h2>
            {!wishlistLoading && (
              <span className="profile-section__count">
                {wishlist.length} {wishlist.length === 1 ? 'car' : 'cars'}
              </span>
            )}
          </div>

          {wishlistLoading && (
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

          {!wishlistLoading && wishlist.length === 0 && (
            <div className="fav-empty">
              <span className="fav-empty__icon">🚗</span>
              <p>No cars in your wishlist yet.</p>
              <Link to="/" className="profile-btn profile-btn--primary">Explore Cars</Link>
            </div>
          )}

          {!wishlistLoading && wishlist.length > 0 && (
            <div className="fav-grid">
              {wishlist.map((car) => (
                <WishlistCard key={car.firestoreId} car={car} uid={user.uid} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
