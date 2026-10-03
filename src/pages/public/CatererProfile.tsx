import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import type { Caterer } from '../../types';
import {
  MapPin, Users, Clock, Check, CheckCircle, ChevronRight,
  Send, Eye, LogIn,
} from 'lucide-react';

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M6 1l1.236 3.8H11L8.18 6.908l1.236 3.8L6 8.6l-3.416 2.108 1.236-3.8L1 4.8h3.764z" />
        </svg>
      ))}
    </div>
  );
}

export function CatererProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inquiryForm, setInquiryForm] = useState({ customerName: '', customerEmail: '', eventDate: '', guestCount: '', eventType: '', message: '' });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  useEffect(() => {
    if (user?.role === 'customer') {
      setInquiryForm(p => ({ ...p, customerName: p.customerName || user.name, customerEmail: p.customerEmail || user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;
    const fetchCaterer = async () => {
      try {
        const { caterer } = await api.getCaterer(id);
        setCaterer(caterer);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCaterer();
    const interval = setInterval(fetchCaterer, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caterer) return;
    setInquirySubmitting(true);
    setInquiryError('');
    try {
      await api.submitInquiry({
        catererId: caterer.id,
        catererName: caterer.name,
        customerName: inquiryForm.customerName,
        customerEmail: inquiryForm.customerEmail,
        eventDate: inquiryForm.eventDate,
        guestCount: parseInt(inquiryForm.guestCount) || 0,
        eventType: inquiryForm.eventType,
        message: inquiryForm.message,
      });
      setInquirySuccess(true);
      setInquiryForm({ customerName: '', customerEmail: '', eventDate: '', guestCount: '', eventType: '', message: '' });
    } catch (e: any) {
      setInquiryError(e.message);
    } finally {
      setInquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#F6F6FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#B84922', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Loading caterer profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !caterer) {
    return (
      <div style={{ background: '#F6F6FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Caterer not found</p>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>{error}</p>
          <Link to="/caterers" style={{ background: '#B84922', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>Browse All Caterers</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F6F6FA', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }} className="py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight size={12} />
          <Link to="/caterers" className="hover:text-gray-900">Browse Caterers</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#374151', fontWeight: 600 }}>{caterer.name}</span>
        </div>
      </div>

      {/* Hero images */}
      <div style={{ background: '#1C1F2B' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ height: 260 }}>
            <div style={{ gridColumn: 'span 2', borderRadius: 12, overflow: 'hidden', background: '#374151', height: '100%' }}>
              <img src={caterer.gallery[0] ?? caterer.imageUrl} alt={caterer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="hidden sm:flex flex-col gap-3" style={{ height: '100%' }}>
              {[caterer.gallery[1] ?? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&auto=format',
                caterer.gallery[2] ?? 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=200&fit=crop&auto=format'].map((img, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 12, overflow: 'hidden', background: '#374151' }}>
                  <img src={img} alt={`${caterer.name} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Header card */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #E5E7EB', marginBottom: 20 }}>
              {caterer.verified && (
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ width: 6, height: 6, background: '#B84922', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verified Catering Partner</span>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <StarRating rating={caterer.rating} size={15} />
                <span style={{ fontSize: 13, color: '#6B7280' }}>{caterer.rating} · {caterer.reviewCount} reviews</span>
              </div>
              <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 36px)', color: '#111318', marginBottom: 8 }}>{caterer.name}</h1>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>{caterer.tagline}</p>
              <div className="flex flex-wrap gap-x-8 gap-y-3" style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} color="#9CA3AF" />
                  <span style={{ color: '#374151', fontWeight: 600 }}>{caterer.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} color="#9CA3AF" />
                  <span style={{ color: '#374151', fontWeight: 600 }}>{caterer.capacityMin}–{caterer.capacityMax} guests</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} color="#9CA3AF" />
                  <span style={{ color: '#374151', fontWeight: 600 }}>Response: {caterer.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Packages */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #E5E7EB', marginBottom: 20 }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ width: 7, height: 7, background: '#B84922', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Menus & Packages</span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: '#111318', marginBottom: 6 }}>Choose a service style</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Flexible starting packages so you can find the right fit for your tasting and conversation.</p>
              <div className="flex flex-col gap-4">
                {caterer.packages.map(pkg => (
                  <div key={pkg.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '18px 20px' }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111318', marginBottom: 4 }}>{pkg.name}</h3>
                        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{pkg.description}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: 18, color: '#111318' }}>₱{pkg.pricePerGuest.toLocaleString()}<span style={{ fontWeight: 400, fontSize: 13, color: '#9CA3AF' }}> / guest</span></p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Min. {pkg.minGuests} guests</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #E5E7EB', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Our Story</p>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: '#111318', marginBottom: 12 }}>Food that feels generous and personal</h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, marginBottom: 16 }}>{caterer.description}</p>
              <div className="flex flex-col gap-2">
                {caterer.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                    <Check size={14} color="#16A34A" strokeWidth={2.5} /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {caterer.reviews.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #E5E7EB', marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Customer Reviews</p>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: '#111318', marginBottom: 16 }}>Loved by hosts across the metro</h2>
                <div className="flex flex-col gap-5">
                  {caterer.reviews.map(r => (
                    <div key={r.id} style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                      <StarRating rating={r.rating} size={13} />
                      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '8px 0' }}>"{r.content}"</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}><strong style={{ color: '#374151' }}>{r.reviewerName}</strong> · {r.eventType}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Continue Exploring</p>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: '#111318', marginBottom: 16 }}>Related caterers</h2>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'Casa Amihan Catering', id: '2', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=180&fit=crop&auto=format', rating: 4.5, price: '25,000' },
                  { name: 'The Linen Table', id: '3', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=180&fit=crop&auto=format', rating: 4.8, price: '45,000' },
                  { name: 'Gathered Kitchen', id: '4', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=180&fit=crop&auto=format', rating: 4.7, price: '22,000' },
                ].map(rel => (
                  <Link key={rel.name} to={`/caterers/${rel.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                      <div style={{ height: 130 }}>
                        <img src={rel.img} alt={rel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#111318' }}>{rel.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={rel.rating} size={11} />
                          <span style={{ fontSize: 11, color: '#6B7280' }}>{rel.rating} · Packages from ₱{rel.price}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside style={{ width: '100%', maxWidth: 320, flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: 80 }} id="inquire">
              {/* Login prompt */}
              {!user && (
                <div style={{ background: '#fff', borderRadius: 14, padding: '22px', border: '1px solid #E5E7EB', marginBottom: 14 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111318', marginBottom: 6 }}>Log in to send an inquiry</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>Sign in to your CaterHub account to send this inquiry directly to the caterer's booking manager.</p>
                  <Link to="/login" state={{ from: location.pathname }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px', borderRadius: 8, textDecoration: 'none' }}>
                    <LogIn size={15} /> Log In to Continue
                  </Link>
                  <p style={{ fontSize: 12.5, color: '#6B7280', textAlign: 'center', marginTop: 12 }}>
                    New here? <Link to="/signup" state={{ from: location.pathname }} style={{ color: '#B84922', fontWeight: 700 }}>Create a free account</Link>
                  </p>
                </div>
              )}
              {user?.role === 'caterer' && (
                <div style={{ background: '#fff', borderRadius: 14, padding: '22px', border: '1px solid #E5E7EB', marginBottom: 14 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111318', marginBottom: 6 }}>You’re logged in as a caterer</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>Inquiries can be sent from a customer account. Manage your own listing from your <Link to="/dashboard" style={{ color: '#B84922', fontWeight: 700 }}>dashboard</Link>.</p>
                </div>
              )}

              {/* Inquiry form */}
              {user?.role === 'customer' && (
              <div style={{ background: '#fff', borderRadius: 14, padding: '22px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111318', marginBottom: 16 }}>Check availability</h3>

                {inquirySuccess ? (
                  <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '20px', textAlign: 'center', border: '1px solid #BBFCCD' }}>
                    <CheckCircle size={32} color="#16A34A" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>Inquiry Sent!</p>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>{caterer.name} will respond within {caterer.responseTime}.</p>
                    <button onClick={() => setInquirySuccess(false)} style={{ marginTop: 12, background: '#B84922', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={submitInquiry} className="flex flex-col gap-3">
                    {[
                      { label: 'Event date', type: 'date', key: 'eventDate', placeholder: '' },
                      { label: 'Guest count', type: 'number', key: 'guestCount', placeholder: '100' },
                      { label: 'Event type / location', type: 'text', key: 'eventType', placeholder: 'Venue or city' },
                      { label: 'Your name', type: 'text', key: 'customerName', placeholder: 'Full name' },
                      { label: 'Your email', type: 'email', key: 'customerEmail', placeholder: 'you@example.com' },
                    ].map(({ label, type, key, placeholder }) => (
                      <div key={key}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          required={['customerName', 'customerEmail'].includes(key)}
                          value={(inquiryForm as any)[key]}
                          onChange={e => setInquiryForm(p => ({ ...p, [key]: e.target.value }))}
                          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 10px', fontSize: 13, outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#B84922'}
                          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                    ))}
                    {inquiryError && <p style={{ fontSize: 12, color: '#DC2626' }}>{inquiryError}</p>}
                    <button type="submit" disabled={inquirySubmitting}
                      style={{ background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', opacity: inquirySubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Send size={14} /> {inquirySubmitting ? 'Sending...' : 'Send Free Inquiry'}
                    </button>
                    <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>
                      Usually responds within {caterer.responseTime}. Contact prices and service terms are handled directly by the booking manager.
                    </p>
                  </form>
                )}
              </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
