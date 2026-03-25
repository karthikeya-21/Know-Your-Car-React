import { useFetch } from '../hooks/useFetch';
import { api } from '../utils/api';
import './About.css';

export default function About() {
  const { data, loading, error } = useFetch(api.getAbout, []);
  const about = data?.[0];

  return (
    <div className="about-page">

      {/* ── Hero banner ── */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <p className="about-hero__eyebrow">Who we are</p>
          <h1 className="about-hero__title">About<br /><em>Know Your Car</em></h1>
        </div>
        <div className="about-hero__rule" />
      </section>

      <div className="about-body">

        {loading && (
          <div className="about-skeleton">
            {[80, 60, 90, 50, 70].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: `${w}%`, height: '16px', marginBottom: '12px' }} />
            ))}
          </div>
        )}

        {error && (
          <div className="about-error">
            <p>Could not load about content. Please try again later.</p>
          </div>
        )}

        {about && (
          <div className="about-content">

            {about.title && (
              <h2 className="about-content__title">{about.title}</h2>
            )}

            {about.description && (
              <p className="about-content__desc">{about.description}</p>
            )}

            {about.mission && (
              <div className="about-block">
                <h3 className="about-block__label">Our Mission</h3>
                <p className="about-block__text">{about.mission}</p>
              </div>
            )}

            {about.vision && (
              <div className="about-block">
                <h3 className="about-block__label">Our Vision</h3>
                <p className="about-block__text">{about.vision}</p>
              </div>
            )}

            {about.team && Array.isArray(about.team) && about.team.length > 0 && (
              <div className="about-team">
                <h3 className="about-team__title">The Team</h3>
                <div className="about-team__grid">
                  {about.team.map((member, i) => (
                    <div key={i} className="team-card">
                      {member.photo && (
                        <img src={member.photo} alt={member.name} className="team-card__photo" />
                      )}
                      <div className="team-card__info">
                        <strong className="team-card__name">{member.name}</strong>
                        {member.role && <span className="team-card__role">{member.role}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback if MongoDB doc only has raw fields */}
            {!about.title && !about.description && (
              <div className="about-raw">
                {Object.entries(about)
                  .filter(([k]) => k !== '_id')
                  .map(([key, val]) => (
                    <div key={key} className="about-block">
                      <h3 className="about-block__label">{key}</h3>
                      <p className="about-block__text">{String(val)}</p>
                    </div>
                  ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
