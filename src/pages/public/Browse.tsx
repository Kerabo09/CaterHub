import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Building2, Gift, UtensilsCrossed, GraduationCap, Sparkles,
  Search, MapPin, CalendarDays, Wallet, ArrowRight, Check,
  BadgeCheck, ArrowLeftRight, FileText, ChevronRight,
} from 'lucide-react';

const EVENT_CATEGORIES = [
  { Icon: Heart, label: 'Weddings & Anniversaries', count: 48 },
  { Icon: Building2, label: 'Corporate & Conferences', count: 61 },
  { Icon: Gift, label: 'Birthdays & Milestones', count: 72 },
  { Icon: UtensilsCrossed, label: 'Intimate Dinners & Gatherings', count: 39 },
  { Icon: GraduationCap, label: 'School & Church Banquets', count: 28 },
  { Icon: Sparkles, label: 'Holiday & Seasonal Celebrations', count: 35 },
];



export function Browse() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('q', location);
    if (eventType) params.set('eventType', eventType);
    if (guestCount) params.set('minGuests', guestCount);
    if (budget) params.set('maxBudget', budget);
    navigate(`/caterers?${params.toString()}`);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero search */}
      <section style={{ background: '#F6F6FA', paddingTop: 40, paddingBottom: 40 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1.5 mb-4">
            <span style={{ width: 8, height: 8, background: '#B84922', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Built to Find It Faster, Plan It Better</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, color: '#111318', lineHeight: 1.15, marginBottom: 16, maxWidth: 600 }}>
            Find the right caterer for your event,{' '}
            <span style={{ color: '#B84922' }}>at your budget</span>
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, maxWidth: 560, marginBottom: 28 }}>
            Discover independent caterers, compare packages, check availability, and send inquiries to multiple caterers in minutes.
          </p>

          <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB', maxWidth: 800 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                  <MapPin size={12} color="#B84922" /> Sort by Area City
                </label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Metro Manila"
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#374151', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                  <Heart size={12} color="#B84922" /> Event Nature
                </label>
                <select value={eventType} onChange={e => setEventType(e.target.value)}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#374151', outline: 'none', background: '#fff' }}>
                  <option value="">Select Event Nature</option>
                  {EVENT_CATEGORIES.map(e => <option key={e.label} value={e.label}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                  <CalendarDays size={12} color="#B84922" /> Event Date
                </label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#374151', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                  <Wallet size={12} color="#B84922" /> Budget
                </label>
                <select value={budget} onChange={e => setBudget(e.target.value)}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#374151', outline: 'none', background: '#fff' }}>
                  <option value="">All Budgets</option>
                  <option value="20000">Up to ₱20,000</option>
                  <option value="50000">Up to ₱50,000</option>
                  <option value="100000">Up to ₱100,000</option>
                  <option value="150000">₱150,000+</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                Popular: <span style={{ color: '#B84922', cursor: 'pointer' }}>Tondo Caterers</span> · <span style={{ color: '#B84922', cursor: 'pointer' }}>Metro Caterers</span> · <span style={{ color: '#B84922', cursor: 'pointer' }}>Province Events</span>
              </p>
              <button type="submit" style={{ background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, padding: '11px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Search size={15} /> Search Caterers
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ background: '#fff', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { Icon: BadgeCheck, title: '100% Free to browse', desc: 'Browsing profiles and sending inquiries are free for event hosts' },
              { Icon: ArrowLeftRight, title: 'Multi-Vendor Comparison', desc: 'Compare qualified options with their direct contact and payment details' },
              { Icon: FileText, title: 'Direct Off-Platform Partners', desc: 'Caterers manage all quotation, deposits, contracts, and service terms' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div style={{ width: 36, height: 36, background: '#FFF5F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#B84922" strokeWidth={1.75} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#111318', marginBottom: 2 }}>{title}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by event type */}
      <section style={{ background: '#F6F6FA' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: '#111318' }}>Browse by Event Type</h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Find caterers specialized in your event type.</p>
            </div>
            <Link to="/caterers" style={{ fontSize: 13, fontWeight: 700, color: '#B84922', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all types <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {EVENT_CATEGORIES.map(({ Icon, label, count }) => (
              <Link
                key={label}
                to={`/caterers?eventType=${encodeURIComponent(label)}`}
                style={{ background: '#fff', borderRadius: 12, padding: '20px 14px', textAlign: 'center', textDecoration: 'none', border: '1px solid #E5E7EB' }}
                className="hover:shadow-md transition-shadow"
              >
                <div style={{ width: 44, height: 44, background: '#FFF5F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Icon size={22} color="#B84922" strokeWidth={1.75} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#111318', marginTop: 10, lineHeight: 1.4 }}>{label}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{count} caterers</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#F6F6FA', borderTop: '1px solid #E5E7EB' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Simple & Transparent</p>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: '#111318', marginBottom: 8 }}>How CaterHub Works</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { n: '1', t: 'Discover & Filter', d: 'Browse verified caterers by location, guest count, budget, and event type.' },
              { n: '2', t: 'Send Free Inquiries', d: 'Message caterers directly with your event details. No hidden platform fees.' },
              { n: '3', t: 'Finalize Directly', d: 'Communicate, receive quotes, agree on terms, and book directly with the caterer.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#B84922', color: '#fff', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{s.n}</div>
                <p style={{ fontWeight: 700, color: '#111318', fontSize: 15, marginBottom: 6 }}>{s.t}</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caterer CTA */}
      <section style={{ background: '#fff' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>For Catering Business Owners</p>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', color: '#111318', lineHeight: 1.2, marginBottom: 16 }}>Are you a Catering Business Owner?</h2>
              <ul className="flex flex-col gap-3 mb-24">
                {['No commission fee per booking', 'Direct client relationships', 'Full profile control'].map(f => (
                  <li key={f} style={{ fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={15} color="#16A34A" strokeWidth={2.5} /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 flex-wrap">
                <Link to="/partner-login" style={{ background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Get Started <ArrowRight size={15} />
                </Link>
              </div>
            </div>
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 320 }}>
              <div style={{ background: '#F6F6FA', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Quick snapshot</p>
                {[['180+', 'Active caterers listed'], ['12k+', 'Events facilitated'], ['₱0', 'Commission per booking'], ['24h', 'Avg. verification time']].map(([v, l]) => (
                  <div key={l} className="flex items-center justify-between mb-4">
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#B84922' }}>{v}</span>
                    <span style={{ fontSize: 12, color: '#6B7280', textAlign: 'right', maxWidth: 140 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
