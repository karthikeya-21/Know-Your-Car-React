import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CarCard.css';

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="stars" aria-label={`Rating: ${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(r) ? 'star star--filled' : 'star'}>★</span>
      ))}
      <span className="stars__num">{r}</span>
    </div>
  );
}

export default function CarCard({ car, index }) {
  const [flipped, setFlipped] = useState(false);
  const specs = car.specifications ||car.specificatios|| {};

  return (
    <Link
      to={`/car/${encodeURIComponent(car.name)}`}
      className="car-card"
      style={{ '--delay': `${index * 60}ms` }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      aria-label={`View details for ${car.name}`}
    >
      {/* ── Image side ── */}
      <div className="car-card__image-wrap">
        <img
          src={car.image || car.Image || '/placeholder.png'}
          alt={car.name}
          className="car-card__image"
          loading="lazy"
        />

        {/* Specs overlay on hover */}
        <div className={`car-card__specs-overlay ${flipped ? 'visible' : ''}`}>
          <p className="car-card__specs-title">Specifications</p>
          <ul className="car-card__specs-list">
            {specs.engine       && <li><span>Engine</span><strong>{specs.engine}</strong></li>}
            {specs.fuel         && <li><span>Fuel</span><strong>{specs.fuel}</strong></li>}
            {specs.power        && <li><span>Power</span><strong>{specs.power}</strong></li>}
            {specs.acceleration && <li><span>0–100</span><strong>{specs.acceleration}</strong></li>}
            {specs.drivetrain   && <li><span>Drive</span><strong>{specs.drivetrain}</strong></li>}
            {specs.seating      && <li><span>Seats</span><strong>{specs.seating}</strong></li>}
          </ul>
        </div>

        <span className="car-card__brand-tag">{car.brand}</span>
        <span className="car-card__year-tag">{car.year}</span>
      </div>

      {/* ── Info ── */}
      <div className="car-card__body">
        <h3 className="car-card__name">{car.name}</h3>
        <div className="car-card__footer">
          <StarRating rating={car.rating} />
          <span className="car-card__price">
            ₹{Number(car.price.replace(/,/g, '')).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Link>
  );
}
