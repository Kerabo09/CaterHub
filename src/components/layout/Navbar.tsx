import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSrc from '../../assets/logo.png';
import { useAuth } from '../../lib/AuthContext';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();
  const { user, logOut } = useAuth();
  const home = user?.role === 'caterer' ? { to: '/dashboard', label: 'My dashboard' } : { to: '/my-inquiries', label: 'My inquiries' };
  const active = (p: string) => loc.pathname === p;
  const onAuth = ['/login', '/signup', '/partner-login', '/partner-signup'].includes(loc.pathname);
  const onPartner = loc.pathname.startsWith('/partner');
  const isSignup = loc.pathname.endsWith('signup');
  const roleStyle = (on: boolean) => (on ? { background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.1)' } : {});

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" style={{ marginLeft: -8 }}>
          <img src={logoSrc} alt="CaterHub" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/browse" style={{ color: active('/browse') ? '#B84922' : '#374151' }} className="hover:text-[#B84922] transition-colors">Browse Caterers</Link>
          <Link to="/how-it-works" style={{ color: active('/how-it-works') ? '#B84922' : '#374151' }} className="hover:text-[#B84922] transition-colors">How It Works</Link>
          <Link to={user?.role === 'caterer' ? '/dashboard' : '/for-caterers'} style={{ color: '#374151', fontWeight: 700 }} className="hover:text-[#B84922] transition-colors">For Caterers</Link>
          <Link to="/contact" style={{ color: active('/contact') ? '#B84922' : '#374151' }} className="hover:text-[#B84922] transition-colors">About</Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to={home.to} className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 hover:bg-gray-50" style={{ color: '#B84922' }}>{home.label}</Link>
              <span className="text-xs text-gray-500 max-w-[140px] truncate" title={user.email}>{user.name}</span>
              <button onClick={logOut} className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 hover:bg-gray-50" style={{ color: '#374151' }}>Log out</button>
            </>
          ) : (
            <div className="flex items-center rounded-full border border-gray-200 overflow-hidden text-xs font-semibold" style={onAuth ? { background: '#F3F5FB' } : undefined}>
              <Link to={isSignup ? '/signup' : '/login'} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 transition-colors" style={{ color: '#374151', ...roleStyle(onAuth && !onPartner) }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />
                Customer
              </Link>
              <Link to={isSignup ? '/partner-signup' : '/partner-login'} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 transition-colors" style={{ color: '#374151', ...roleStyle(onAuth && onPartner) }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#B84922', display: 'inline-block' }} />
                Caterer
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {menuOpen ? (
              <path d="M4 4L16 16M16 4L4 16" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <rect x="2" y="5" width="16" height="1.5" rx="1" fill="#374151" />
                <rect x="2" y="9.25" width="16" height="1.5" rx="1" fill="#374151" />
                <rect x="2" y="13.5" width="16" height="1.5" rx="1" fill="#374151" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #E5E7EB' }} className="md:hidden px-4 py-4 flex flex-col gap-4 text-sm font-medium">
          <Link to="/browse" onClick={() => setMenuOpen(false)} style={{ color: '#374151' }}>Browse Caterers</Link>
          <Link to="/how-it-works" onClick={() => setMenuOpen(false)} style={{ color: '#374151' }}>How It Works</Link>
          <Link to="/for-caterers" onClick={() => setMenuOpen(false)} style={{ color: '#374151', fontWeight: 700 }}>For Caterers</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} style={{ color: '#374151' }}>About</Link>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            {user ? (
              <>
                <Link to={home.to} onClick={() => setMenuOpen(false)} style={{ color: '#B84922' }} className="text-sm font-semibold">{home.label}</Link>
                <button onClick={() => { logOut(); setMenuOpen(false); }} style={{ color: '#374151' }} className="text-sm font-semibold">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: '#374151' }} className="text-sm font-semibold">Customer Login</Link>
                <Link to="/partner-login" onClick={() => setMenuOpen(false)} style={{ color: '#B84922' }} className="text-sm font-semibold">Caterer Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
