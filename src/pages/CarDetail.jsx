import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { addToWishlist } from '../firebase/services';
import './CarDetail.css';

const SPEC_LABELS = {
  fuel:         'Fuel Type',
  engine:       'Engine',
  power:        'Power & Torque',
  drivetrain:   'Drivetrain',
  acceleration: '0–100 km/h',
  seating:      'Seating',
};

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="cd-stars" aria-label={`Rating: ${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(r) ? 'cd-star cd-star--filled' : 'cd-star'}>★</span>
      ))}
      <span className="cd-stars__label">{r} / 5</span>
    </div>
  );
}

function SpecRow({ label, value, index }) {
  return (
    <div className="cd-spec-row" style={{ '--i': index }}>
      <span className="cd-spec-row__label">{label}</span>
      <span className="cd-spec-row__value">{value}</span>
    </div>
  );
}

export default function CarDetail() {
  const { name }    = useParams();
  const navigate    = useNavigate();
  const decodedName = decodeURIComponent(name);
  const { user, wishlist, addToWishlistCache } = useAuth();

  const { data: car, loading, error } = useFetch(
    () => api.getCarByName(decodedName),
    [decodedName]
  );

  // Check if already in wishlist from cache — no extra fetch needed
  const isInWishlist = useMemo(() => {
    if (!wishlist || !car) return false;
    return wishlist.some((w) => w.name === car.name);
  }, [wishlist, car]);

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (isInWishlist) { navigate('/profile'); return; }
    try {
      const result = await addToWishlist(user.uid, car);
      if (!result.alreadyExists) {
        // Update cache immediately — no refetch
        addToWishlistCache({ ...car, firestoreId: Date.now().toString(), Image: car.image });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-loading">
          <div className="cd-loading__bar" />
          <div className="cd-loading__bar cd-loading__bar--2" />
          <div className="cd-loading__bar cd-loading__bar--3" />
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="cd-page cd-page--centered">
        <div className="cd-not-found">
          <span className="cd-not-found__code">404</span>
          <h2 className="cd-not-found__title">Car not found</h2>
          <p className="cd-not-found__sub">We couldn't find <strong>{decodedName}</strong> in our database.</p>
          <Link to="/" className="cd-btn cd-btn--primary">← Back to Explore</Link>
        </div>
      </div>
    );
  }

  const specs = car.specifications || car.specificatios || {};

  return (
    <div className="cd-page">

      <nav className="cd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="cd-breadcrumb__link">Explore</Link>
        <span className="cd-breadcrumb__sep" aria-hidden="true">›</span>
        <span className="cd-breadcrumb__current">{car.name}</span>
      </nav>

      <div className="cd-layout">

        <div className="cd-image-col">
          <div className="cd-image-wrap">
            <img src={car.image || car.Image || '/placeholder.png'} alt={car.name} className="cd-image" />
            <div className="cd-image-badges">
              <span className="cd-badge cd-badge--brand">{car.brand}</span>
              <span className="cd-badge cd-badge--year">{car.year}</span>
            </div>
          </div>
          <div className="cd-price-block">
            <span className="cd-price-block__label">Starting price</span>
            <span className="cd-price-block__price">₹{Number(car.price.replace(/,/g, '')).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="cd-info-col">
          <div className="cd-header">
            <p className="cd-header__brand">{car.brand}</p>
            <h1 className="cd-header__name">{car.name}</h1>
            <StarRating rating={car.rating} />
          </div>

          <div className="cd-divider" />

          <div className="cd-specs">
            <h2 className="cd-specs__title">Specifications</h2>
            <div className="cd-specs__grid">
              {Object.entries(SPEC_LABELS).map(([key, label], i) =>
                specs[key] ? <SpecRow key={key} label={label} value={specs[key]} index={i} /> : null
              )}
            </div>
          </div>

          <div className="cd-divider" />

          <div className="cd-actions">
            <button
              className={`cd-wishlist-btn ${isInWishlist ? 'cd-wishlist-btn--added' : ''}`}
              onClick={handleWishlist}
            >
              {isInWishlist ? '♥  Go to Wishlist' : '♡  Add to Wishlist'}
            </button>
            <button className="cd-btn cd-btn--secondary" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
