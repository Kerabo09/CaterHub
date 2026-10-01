import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Caterer } from '../types';
import {
  MapPin, Users, Wallet, Zap, ChevronRight, SlidersHorizontal,
  X, RotateCcw, ArrowRight, Check,
} from 'lucide-react';

const EVENT_TYPES = [
  'Weddings & Nuptials', 'Corporate Events', 'Birthdays & Milestones',
  'Social Gatherings & Anniversaries', 'Intimate Dinners & Gatherings',
  'School & Church Banquets', 'Banquets & Major Conventions', 'Holiday & Seasonal Celebrations',
];

const CAPACITY_OPTS = ['Up to 50 guests', '50–150 guests', '150–300 guests', '300+ guests'];
const SERVICE_STYLES = ['Buffet Station Setup', 'Formal Plated Courses', 'Packed/Meals Delivery', 'Cocktail & Grazing Table', 'Live Culinary Station'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M6 1l1.236 3.8H11L8.18 6.908l1.236 3.8L6 8.6l-3.416 2.108 1.236-3.8L1 4.8h3.764z" />
        </svg>
      ))}
    </div>
  );
}

function CatererCard({ cat }: { cat: Caterer }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
      <div style={{ position: 'relative', height: 190, background: '#E5E7EB' }}>
        <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="#F59E0B"><path d="M6 1l1.236 3.8H11L8.18 6.908l1.236 3.8L6 8.6l-3.416 2.108 1.236-3.8L1 4.8h3.764z" /></svg>
            {cat.reviewCount > 0 ? `${cat.rating.toFixed(1)} (${cat.reviewCount})` : 'New'}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ background: cat.available ? '#DCFCE7' : '#FEF9C3', color: cat.available ? '#16A34A' : '#CA8A04', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
            {cat.available ? 'Accepting bookings' : 'Fully booked'}
          </span>
        </div>
        {cat.areas[0] && (
          <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
            <span style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {cat.areas[0]}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '16px 18px' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111318', marginBottom: 4 }}>{cat.name}</h3>
        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 1.5 }}>{cat.tagline}</p>
        {cat.serviceStyles?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {cat.serviceStyles.slice(0, 3).map(s => (
              <span key={s} style={{ fontSize: 11, color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 20 }}>{s}</span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mb-12" style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}><Wallet size={10} /> Min Spend</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111318' }}>₱{cat.minSpend.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> Capacity</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111318' }}>{cat.capacityMin}–{cat.capacityMax}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#6B7280' }}>Response</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111318' }}>{cat.responseTime}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/caterers/${cat.id}`}
            style={{ flex: 1, textAlign: 'center', border: '1.5px solid #E5E7EB', color: '#374151', fontWeight: 600, fontSize: 13, padding: '9px', borderRadius: 8, textDecoration: 'none' }}
            className="hover:border-gray-400 transition-colors"
          >
            View Menu & Profile
          </Link>
          <Link
            to={`/caterers/${cat.id}#inquire`}
            style={{ flex: 1, textAlign: 'center', background: '#B84922', color: '#fff', fontWeight: 600, fontSize: 13, padding: '9px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <Zap size={13} /> Quick Inquire
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [maxSpend, setMaxSpend] = useState(150000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const q = searchParams.get('q') ?? '';
  const eventTypeFilter = searchParams.get('eventType') ?? '';
  const minGuests = Number(searchParams.get('minGuests')) || undefined;
  const maxBudget = Number(searchParams.get('maxBudget')) || undefined;

  const fetchCaterers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { caterers } = await api.getCaterers({ q: q || undefined, eventType: eventTypeFilter || undefined, minGuests, maxBudget });
      setCaterers(caterers);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, eventTypeFilter, minGuests, maxBudget]);

  useEffect(() => {
    fetchCaterers();
    const interval = setInterval(fetchCaterers, 30000);
    return () => clearInterval(interval);
  }, [fetchCaterers]);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const filteredCaterers = caterers.filter(cat => {
    if (selectedEventTypes.length > 0 && !cat.eventTypes.some(e => selectedEventTypes.some(s => e.toLowerCase().includes(s.toLowerCase())))) return false;
    if (selectedStyles.length > 0 && !cat.serviceStyles.some(e => selectedStyles.some(s => e.toLowerCase().includes(s.toLowerCase())))) return false;
    if (cat.minSpend > maxSpend) return false;
    return true;
  });

  const resetFilters = () => {
    setSelectedEventTypes([]);
    setSelectedStyles([]);
    setMaxSpend(150000);
    setSearchParams({});
  };

  const Sidebar = () => (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 18px' }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontWeight: 700, fontSize: 14, color: '#111318', display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={15} /> Filter Caterers
        </p>
        <button onClick={resetFilters} style={{ fontSize: 12, color: '#B84922', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
          <RotateCcw size={11} /> Clear All
        </button>
      </div>

      <div className="mb-6">
        <p style={{ fontWeight: 600, fontSize: 13, color: '#111318', marginBottom: 8 }}>Starting Package Spend</p>
        <div className="flex justify-between text-xs mb-2" style={{ color: '#9CA3AF' }}>
          <span>₱10k</span><span>₱{(maxSpend / 1000).toFixed(0)}k</span>
        </div>
        <input type="range" min={10000} max={150000} step={5000} value={maxSpend} onChange={e => setMaxSpend(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#B84922' }} />
      </div>

      <div className="mb-6">
        <p style={{ fontWeight: 600, fontSize: 13, color: '#111318', marginBottom: 8 }}>Event Types</p>
        <div className="flex flex-col gap-2">
          {EVENT_TYPES.map(et => (
            <label key={et} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedEventTypes.includes(et)} onChange={() => toggleFilter(selectedEventTypes, setSelectedEventTypes, et)}
                style={{ accentColor: '#B84922' }} />
              {et}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p style={{ fontWeight: 600, fontSize: 13, color: '#111318', marginBottom: 8 }}>Guest Capacity</p>
        <div className="flex flex-col gap-2">
          {CAPACITY_OPTS.map(c => (
            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
              <input type="radio" name="capacity" style={{ accentColor: '#B84922' }} /> {c}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p style={{ fontWeight: 600, fontSize: 13, color: '#111318', marginBottom: 8 }}>Service Styles</p>
        <div className="flex flex-col gap-2">
          {SERVICE_STYLES.map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedStyles.includes(s)} onChange={() => toggleFilter(selectedStyles, setSelectedStyles, s)}
                style={{ accentColor: '#B84922' }} />
              {s}
            </label>
          ))}
        </div>
      </div>

      <button style={{ width: '100%', background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 8, padding: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Check size={14} /> Apply Selected Filters
      </button>

      <div style={{ marginTop: 20, background: '#FFF7F5', borderRadius: 10, padding: '14px', border: '1px solid #FED7C7' }}>
        <p style={{ fontWeight: 700, fontSize: 12, color: '#B84922', marginBottom: 6 }}>Need Custom Sourcing?</p>
        <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>Planning an enterprise gathering with 500+ pax? Our sourcing specialists can help compile custom proposals.</p>
        <Link to="/contact" style={{ fontSize: 12, fontWeight: 700, color: '#B84922', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
          Request Multi-Vendor RFP <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#F6F6FA', minHeight: '100vh' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }} className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Link to="/" className="hover:text-gray-600">Home</Link>
            <ChevronRight size={12} />
            <span>Browse Caterers</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 22, color: '#111318' }}>Catering Discovery Directory</h1>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                Displaying <strong>{filteredCaterers.length} verified</strong> catering businesses matching your criteria
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden flex items-center gap-2 text-sm font-semibold"
                style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', background: '#fff', color: '#374151', cursor: 'pointer' }}>
                <SlidersHorizontal size={14} /> Filters
              </button>
              <select style={{ fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', background: '#fff', color: '#374151' }}>
                <option>Lowest Starting Package</option>
                <option>Highest Rated</option>
                <option>Fastest Response</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Active filter chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>ACTIVE CRITERIA</span>
          {[
            { label: 'Location: All Metro Areas', Icon: MapPin },
            { label: 'Guests: 50–150 pax', Icon: Users },
            { label: 'Budget: All Ranges', Icon: Wallet },
          ].map(f => (
            <span key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '4px 10px', color: '#374151' }}>
              <f.Icon size={11} color="#B84922" /> {f.label}
              <X size={11} style={{ cursor: 'pointer', color: '#9CA3AF' }} />
            </span>
          ))}
          <button onClick={resetFilters} style={{ fontSize: 12, color: '#B84922', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <RotateCcw size={11} /> Reset
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block" style={{ width: 260, flexShrink: 0 }}>
            <Sidebar />
          </aside>

          {/* Mobile filter overlay */}
          {mobileFilterOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileFilterOpen(false)}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, background: '#fff', overflowY: 'auto', padding: 20 }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <p style={{ fontWeight: 700, fontSize: 16 }}>Filters</p>
                  <button onClick={() => setMobileFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} color="#374151" />
                  </button>
                </div>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 14, height: 380, border: '1px solid #E5E7EB' }} className="animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 12, padding: 24, color: '#C53030' }}>
                <p style={{ fontWeight: 600 }}>Unable to load caterers</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>{error}</p>
                <button onClick={fetchCaterers} style={{ marginTop: 12, background: '#B84922', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Retry</button>
              </div>
            ) : filteredCaterers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>No caterers found</p>
                <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 8 }}>Try adjusting your filters.</p>
                <button onClick={resetFilters} style={{ marginTop: 16, background: '#B84922', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Reset Filters</button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  {filteredCaterers.map(cat => <CatererCard key={cat.id} cat={cat} />)}
                </div>
                <div className="flex items-center justify-between mt-8">
                  <p style={{ fontSize: 13, color: '#6B7280' }}>Showing 1–{filteredCaterers.length} of {filteredCaterers.length} caterers</p>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(p => (
                      <button key={p} style={{ width: 32, height: 32, borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: p === 1 ? '#B84922' : '#fff', color: p === 1 ? '#fff' : '#374151', outline: p !== 1 ? '1px solid #E5E7EB' : 'none' }}>{p}</button>
                    ))}
                    <button style={{ height: 32, padding: '0 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: '#1D4ED8', lineHeight: 1.6 }}>
                    <strong>Marketplace Notice:</strong> Pricing shown represents starting vendor estimates. All final terms, tastings, deposits, and menu customizations are confirmed directly between the host and caterer off-platform.
                  </p>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
