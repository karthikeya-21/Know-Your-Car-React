import { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import CarCard from '../components/CarCard';
import './Home.css';

function BrandFilter({ brands, active, onChange }) {
  return (
    <div className="brand-filter" role="radiogroup" aria-label="Filter by brand">
      <button
        className={`brand-filter__pill ${active === 'All' ? 'active' : ''}`}
        onClick={() => onChange('All')}
      >
        All
      </button>
      {brands.map((b) => (
        <button
          key={b._id}
          className={`brand-filter__pill ${active === b.brand ? 'active' : ''}`}
          onClick={() => onChange(b.brand)}
        >
          {b.logo && <img src={b.logo} alt="" className="brand-filter__logo" aria-hidden="true" />}
          {b.brand}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ search, brand }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 36 C20 36 24 28 32 28 C40 28 44 36 44 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="3" fill="currentColor"/>
          <circle cx="40" cy="24" r="3" fill="currentColor"/>
        </svg>
      </div>
      <h3 className="empty-state__title">No cars found</h3>
      <p className="empty-state__sub">
        {search
          ? `No results for "${search}"${brand !== 'All' ? ` in ${brand}` : ''}.`
          : `No cars available${brand !== 'All' ? ` for ${brand}` : ''}.`}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="car-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton--image" />
          <div className="skeleton-card__body">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--row">
              <div className="skeleton skeleton--stars" />
              <div className="skeleton skeleton--price" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [search,      setSearch]  = useState('');
  const [activeBrand, setBrand]   = useState('All');

  const {
    cars,   carsLoading,   carsError,   fetchCars,
    brands, brandsLoading,              fetchBrands,
  } = useData();

  // Trigger fetch on mount — skipped automatically if already cached
  useEffect(() => {
    fetchCars();
    fetchBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!cars) return [];
    return cars.filter((c) => {
      const matchBrand  = activeBrand === 'All' || c.brand === activeBrand;
      const matchSearch = !search.trim() || c.name.toLowerCase().includes(search.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [cars, activeBrand, search]);

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__text">
            <p className="hero__eyebrow">The Car Encyclopedia</p>
            <h1 className="hero__title">
              Know every<br /><em>detail.</em>
            </h1>
            <p className="hero__sub">
              Specs, ratings and everything in between — for every car that matters.
            </p>
          </div>
          <div className="hero__stat-row">
            {cars   && <div className="hero__stat"><span className="hero__stat-num">{cars.length}</span><span className="hero__stat-label">Cars listed</span></div>}
            {brands && <div className="hero__stat"><span className="hero__stat-num">{brands.length}</span><span className="hero__stat-label">Brands</span></div>}
          </div>
        </div>
        <div className="hero__rule" aria-hidden="true" />
      </section>

      {/* ── Controls ── */}
      <section className="controls">
        <div className="controls__inner">
          <div className="search-wrap">
            <svg className="search-wrap__icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="search-wrap__input"
              type="text"
              placeholder="Search cars by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cars"
            />
            {search && (
              <button className="search-wrap__clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
            )}
          </div>

          {!brandsLoading && brands && (
            <BrandFilter brands={brands} active={activeBrand} onChange={setBrand} />
          )}
        </div>
      </section>

      {/* ── Results ── */}
      <main className="results">
        <div className="results__inner">

          {carsError && (
            <div className="error-banner">
              <strong>Could not connect to the server.</strong>
              <span>Make sure your backend is running on <code>localhost:8000</code>.</span>
            </div>
          )}

          {carsLoading && <LoadingSkeleton />}

          {!carsLoading && !carsError && (
            <>
              <div className="results__meta">
                <span className="results__count">
                  {filtered.length} {filtered.length === 1 ? 'car' : 'cars'}
                  {activeBrand !== 'All' && ` · ${activeBrand}`}
                  {search && ` · "${search}"`}
                </span>
              </div>
              {filtered.length === 0
                ? <EmptyState search={search} brand={activeBrand} />
                : (
                  <div className="car-grid">
                    {filtered.map((car, i) => <CarCard key={car._id} car={car} index={i} />)}
                  </div>
                )
              }
            </>
          )}

        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__logo">KnowYourCar</span>
          <span className="site-footer__copy">© {new Date().getFullYear()} — Built with React</span>
        </div>
      </footer>

    </div>
  );
}
