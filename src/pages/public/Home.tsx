import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Building2, Gift, UtensilsCrossed, GraduationCap, Sparkles,
  Check, Search, ArrowRight, BadgeCheck, FileText, Handshake,
  ChevronRight, ChevronDown,
} from 'lucide-react';

const stats = [
  { value: '180+', label: 'Verified catering teams' },
  { value: '12,000+', label: 'Events facilitated' },
  { value: '4.8/5', label: 'Average partner rating' },
  { value: '0%', label: 'CaterHub commission' },
];

const eventTypes = [
  { Icon: Heart, label: 'Weddings & Anniversaries', count: '48 caterers' },
  { Icon: Building2, label: 'Corporate & Conferences', count: '61 caterers' },
  { Icon: Gift, label: 'Birthdays & Milestones', count: '72 caterers' },
  { Icon: UtensilsCrossed, label: 'Intimate Dinners & Gatherings', count: '39 caterers' },
  { Icon: GraduationCap, label: 'School & Church Banquets', count: '28 caterers' },
  { Icon: Sparkles, label: 'Holiday & Seasonal Celebrations', count: '35 caterers' },
];

const HOW_STEPS = [
  { num: '1', title: 'Discover & Filter', desc: "Browse verified caterers by location, guest count, budget, and event type. Every profile is complete so you're never guessing." },
  { num: '2', title: 'Send Free Inquiries', desc: 'Message caterers directly with your event details. Specific dates are prioritized. No middlemen, no hidden platform markups.' },
  { num: '3', title: 'Finalize Directly', desc: 'Communicate directly, receive quotes, agree on terms, and book—all through your direct relationship with the caterer.' },
];

export function Home() {
  const [searchQ, setSearchQ] = useState('');
  const [eventType, setEventType] = useState('');
  const [guests, setGuests] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQ) params.set('q', searchQ);
    if (eventType) params.set('eventType', eventType);
    if (guests) params.set('minGuests', guests);
    navigate(`/caterers?${params.toString()}`);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Hero */}
      <section style={{ background: '#F6F6FA' }} className="pt-10 pb-12 md:pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <span style={{ width: 8, height: 8, background: '#B84922', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#B84922', textTransform: 'uppercase' }}>Built for Better Celebrations</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#111318', lineHeight: 1.1, marginBottom: 20 }}>
                The easiest way to find<br />a caterer you can trust
              </h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
                CaterHub helps event hosts discover independent culinary teams, compare transparent packages, and start a direct conversation—without booking fees or hidden platform markups.
              </p>

              <form onSubmit={handleSearch} className="sbar" role="search">
                <label className="sbar-field sbar-where">
                  <Search size={17} aria-hidden="true" />
                  <span className="sr-only">Location or caterer name</span>
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Location or caterer name"
                    autoComplete="off"
                  />
                </label>
                <label className="sbar-field sbar-select">
                  <span className="sr-only">Event type</span>
                  <select value={eventType} onChange={e => setEventType(e.target.value)}>
                    <option value="">All event types</option>
                    {eventTypes.map(e => <option key={e.label} value={e.label}>{e.label}</option>)}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </label>
                <label className="sbar-field sbar-select">
                  <span className="sr-only">Guest count</span>
                  <select value={guests} onChange={e => setGuests(e.target.value)}>
                    <option value="">Any guest count</option>
                    <option value="25">25+ guests</option>
                    <option value="50">50+ guests</option>
                    <option value="100">100+ guests</option>
                    <option value="300">300+ guests</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </label>
                <button type="submit" className="sbar-btn">Search caterers</button>
              </form>

              <p className="sbar-popular">
                Popular:
                <button type="button" onClick={() => navigate('/caterers?eventType=Weddings')}>Weddings</button>
                <button type="button" onClick={() => navigate('/caterers?eventType=Corporate')}>Corporate</button>
                <button type="button" onClick={() => navigate('/caterers?eventType=Birthdays')}>Birthdays</button>
              </p>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3' }}>
                <img
                  src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=700&h=520&fit=crop&auto=format"
                  alt="Elegant catering event"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#fff', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#B84922', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Better experience section */}
      <section className="py-16 md:py-20" style={{ background: '#F6F6FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div style={{ borderRadius: 16, overflow: 'hidden', flex: '0 0 auto', width: '100%', maxWidth: 420 }}>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=440&fit=crop&auto=format"
                alt="Catering table spread"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="max-w-xl">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Why It Started</p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: '#111318', lineHeight: 1.2, marginBottom: 20 }}>Great catering should be easier to discover</h2>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, marginBottom: 20 }}>
                Planning was often spending days in discovery, browsing menus, checking availability, collecting credentials across scattered sites. We organize the discovery. You keep the relationship.
              </p>
              <ul className="flex flex-col gap-3">
                {['Farm-to-table sourcing', 'Halal-friendly options', 'Health-friendly options', 'Sustainable sourcing'].map(f => (
                  <li key={f} style={{ fontSize: 14, color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={15} color="#16A34A" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* One marketplace, built for both sides */}
      <section style={{ background: '#fff' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Simple & Transparent</p>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#111318', marginBottom: 12 }}>One marketplace, built for both sides</h2>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 500, margin: '0 auto' }}>Pairs event hosts with catering businesses—without blocking them from each other.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div style={{ background: '#F6F6FA', borderRadius: 14, padding: '28px' }}>
              <p style={{ fontWeight: 700, color: '#111318', fontSize: 16, marginBottom: 16 }}>For event hosts</p>
              <ol className="flex flex-col gap-3 list-none">
                {['Find by event, guest count, location, and budget', 'Compare packages and caterer credentials', 'Send and track inquiries on multiple platforms'].map((s, i) => (
                  <li key={i} style={{ fontSize: 14, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#E5E7EB', fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <Link to="/caterers" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 20, fontSize: 13, fontWeight: 700, color: '#B84922', textDecoration: 'none' }}>
                Browse Caterers <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ background: '#1C1F2B', borderRadius: 14, padding: '28px' }}>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: 16, marginBottom: 16 }}>For catering businesses</p>
              <ol className="flex flex-col gap-3 list-none">
                {['Build a complete package and profiles page', 'Get qualified inquiries with direct payment details', 'Own your booking—menus, terms, and payments'].map((s, i) => (
                  <li key={i} style={{ fontSize: 14, color: '#D1D5DB', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#2D3147', fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <Link to="/partner-login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 20, fontSize: 13, fontWeight: 700, color: '#B84922', textDecoration: 'none' }}>
                List Your Business <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by event type */}
      <section style={{ background: '#F6F6FA' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Browse by Type</p>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: '#111318' }}>Browse by Event Type</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginTop: 6 }}>Find caterers specialized in your exact event format.</p>
            </div>
            <Link to="/caterers" style={{ fontSize: 13, fontWeight: 700, color: '#B84922', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {eventTypes.map(({ Icon, label, count }) => (
              <Link
                key={label}
                to={`/caterers?eventType=${encodeURIComponent(label)}`}
                style={{ background: '#fff', borderRadius: 12, padding: '20px 16px', textAlign: 'center', textDecoration: 'none', border: '1px solid #E5E7EB', transition: 'box-shadow 0.2s' }}
                className="hover:shadow-md"
              >
                <div style={{ width: 44, height: 44, background: '#FFF5F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Icon size={22} color="#B84922" strokeWidth={1.75} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111318', marginTop: 10, lineHeight: 1.4 }}>{label}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Standards section */}
      <section style={{ background: '#fff' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Trust & Quality</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: '#111318', marginBottom: 10 }}>Standards that make comparison meaningful</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { Icon: BadgeCheck, title: 'Verified Business Identity', desc: 'We verify business identity, contact ownership, core credentials, and profile claims.' },
              { Icon: FileText, title: 'Structured Package Details', desc: 'Full criteria to find, capacity, price, key menu and service formats clearly.' },
              { Icon: Handshake, title: 'Direct Commercial Terms', desc: 'Quotes, tastings, deposits, contracts, and business stay directly between you and the caterer.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, background: '#FFF5F0', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon size={24} color="#B84922" strokeWidth={1.75} />
                </div>
                <p style={{ fontWeight: 700, color: '#111318', fontSize: 15, marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#F6F6FA' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Simple & Transparent</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: '#111318', marginBottom: 10 }}>How CaterHub Works</h2>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>We organize discovery and initial contact, so you can focus on your event without platform markups or hidden fees.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {HOW_STEPS.map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#B84922', color: '#fff', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{step.num}</div>
                <p style={{ fontWeight: 700, color: '#111318', fontSize: 15, marginBottom: 8 }}>{step.title}</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caterer CTA */}
      <section style={{ background: '#fff' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="max-w-xl">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>The People Behind CaterHub</p>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: '#111318', lineHeight: 1.2, marginBottom: 20 }}>Marketplace builders with hospitality roots</h2>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, marginBottom: 28 }}>
                Our small team bridges marketplace operations, restaurant technology, event production, and hospitality management. We respect time working with chefs, table managers, and frontline hospitality workers across multiple generations.
              </p>
              <Link
                to="/partner-login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 8, textDecoration: 'none' }}
              >
                Join as a Caterer <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 400 }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3' }}>
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=440&fit=crop&auto=format"
                  alt="CaterHub team"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section style={{ background: '#F6F6FA', borderTop: '1px solid #E5E7EB' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111318', marginBottom: 6 }}>Planning something worth gathering for?</h3>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Discover verified caterers, compare packages, and inquire directly in minutes.</p>
          </div>
          <Link
            to="/caterers"
            style={{ background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Find Caterers <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
