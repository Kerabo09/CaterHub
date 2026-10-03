import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Diamond } from 'lucide-react';
import { AUTH_IMAGES, CATERER_STATS, COPY } from './content';
import type { Role } from '../../types';

interface Props {
  role: Role;
  mode: 'login' | 'signup';
  children: ReactNode;
}

/** Split-screen frame for every auth screen: photo + message on one side, the form card on the other. */
export function AuthShell({ role, mode, children }: Props) {
  const c = COPY[role];
  const hero = mode === 'signup' ? c.hero : c.loginHero;
  const [local, remote] = AUTH_IMAGES[role];
  const photo = `linear-gradient(180deg, rgba(8,15,35,.10) 0%, rgba(8,15,35,.35) 45%, rgba(8,15,35,.92) 100%), url(${local}), url(${remote})`;

  return (
    <div className={`auth auth-${role}`}>
      <div className="auth-split">
        <section className="auth-hero" style={{ backgroundImage: photo }} aria-label="CaterHub">
          <span className="auth-badge"><Diamond size={9} fill="currentColor" strokeWidth={0} /> {hero.badge}</span>

          <div className="auth-hero-copy">
            <h2>{hero.title}</h2>
            <p>{hero.text}</p>

            {role === 'caterer' && (
              <dl className="auth-stats">
                {CATERER_STATS.map(s => (
                  <div key={s.value}><dt>{s.value}</dt><dd>{s.label}</dd></div>
                ))}
              </dl>
            )}

            {role === 'customer' && (
              <div className="auth-sample" aria-hidden="true">
                <span className="auth-sample-icon"><Diamond size={13} fill="currentColor" strokeWidth={0} /></span>
                <div className="auth-sample-main">
                  <strong>Savor &amp; Gather Co.</strong>
                  <small><BadgeCheck size={12} /> Verified catering partner</small>
                  <p>Wedding reception · 120 guests · October 18</p>
                </div>
                <span className="auth-sample-tag">Replies within 4h</span>
              </div>
            )}
          </div>
        </section>

        <section className="auth-panel">{children}</section>
      </div>

      <div className="auth-bar">
        <p>© 2026 CaterHub. All rights reserved.</p>
        <strong>{c.footerLabel}</strong>
        <nav aria-label="Legal">
          <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/contact">Help Center</Link>
        </nav>
      </div>
    </div>
  );
}
