import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { api } from '../utils/api';
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

  const { data: car, loading, error } = useFetch(
    () => api.getCarByName(decodedName),
    [decodedName]
  );

  /* ── Loading ── */
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

  /* ── Error ── */
  if (error || !car) {
    return (
      <div className="cd-page cd-page--centered">
        <div className="cd-not-found">
          <span className="cd-not-found__code">404</span>
          <h2 className="cd-not-found__title">Car not found</h2>
          <p className="cd-not-found__sub">
            We couldn't find <strong>{decodedName}</strong> in our database.
          </p>
          <Link to="/" className="cd-btn cd-btn--primary">← Back to Explore</Link>
        </div>
      </div>
    );
  }

  const specs = car.specifications ||car.specificatios|| {};

  return (
    <div className="cd-page">

      {/* ── Breadcrumb ── */}
      <nav className="cd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="cd-breadcrumb__link">Explore</Link>
        <span className="cd-breadcrumb__sep" aria-hidden="true">›</span>
        <span className="cd-breadcrumb__current">{car.name}</span>
      </nav>

      {/* ── Main layout ── */}
      <div className="cd-layout">

        {/* ── Left — Image ── */}
        <div className="cd-image-col">
          <div className="cd-image-wrap">
            <img
              src={car.image || car.Image || '/placeholder.png'}
              alt={car.name}
              className="cd-image"
            />
            <div className="cd-image-badges">
              <span className="cd-badge cd-badge--brand">{car.brand}</span>
              <span className="cd-badge cd-badge--year">{car.year}</span>
            </div>
          </div>

          {/* Price block */}
          <div className="cd-price-block">
            <span className="cd-price-block__label">Starting price</span>
            <span className="cd-price-block__price">
              ₹{Number(car.price.replace(/,/g, '')).toLocaleString('en-IN')}
              
            </span>
          </div>
        </div>

        {/* ── Right — Info ── */}
        <div className="cd-info-col">

          {/* Header */}
          <div className="cd-header">
            <p className="cd-header__brand">{car.brand}</p>
            <h1 className="cd-header__name">{car.name}</h1>
            <StarRating rating={car.rating} />
          </div>

          {/* Divider */}
          <div className="cd-divider" aria-hidden="true" />

          {/* Specs */}
          <div className="cd-specs">
            <h2 className="cd-specs__title">Specifications</h2>
            <div className="cd-specs__grid">
              {Object.entries(SPEC_LABELS).map(([key, label], i) =>
                specs[key] ? (
                  <SpecRow key={key} label={label} value={specs[key]} index={i} />
                ) : null
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="cd-divider" aria-hidden="true" />

          {/* Actions */}
          <div className="cd-actions">
            <button
              className="cd-btn cd-btn--secondary"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
