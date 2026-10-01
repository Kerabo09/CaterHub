import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  CalendarDays, UtensilsCrossed, Handshake, Clock, Mail,
  Plus, Minus, ArrowRight, CheckCircle, Send,
} from 'lucide-react';

const TOPICS = ['I\'m planning an event', 'I run a catering business', 'I need sourcing support', 'Technical issue', 'Other'];

const FAQ_ITEMS = [
  { q: 'Does CaterHub charge organizers?', a: 'No. Browsing profiles and sending inquiries are free for event hosts.' },
  { q: 'Can you change your caterer contract?', a: 'No. Your caterer owns all quotes, deposits, contracts, and service terms.' },
  { q: 'How do caterers get verified?', a: 'We review business identity, contact ownership, core credentials, and profile claims.' },
];

const CONTACT_PATHS = [
  { Icon: CalendarDays, title: "I'm planning an event", desc: 'Get help using search, comparing packages, or preparing a useful inquiry for caterers.' },
  { Icon: UtensilsCrossed, title: 'I run a catering business', desc: 'Ask about verification, profile updates, leads, or joining CaterHub as a listed partner.' },
  { Icon: Handshake, title: 'I need sourcing support', desc: 'Talk to our team about multi-vendor RFPs, 500+ guest events, or recurring corporate programs.' },
];

export function Contact() {
  const [form, setForm] = useState({ fullName: '', email: '', topic: '', eventName: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.submitContact(form);
      setSuccess(true);
      setForm({ fullName: '', email: '', topic: '', eventName: '', message: '' });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F6F6FA' }}>
      {/* Header */}
      <section style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', textAlign: 'center', padding: '48px 24px 40px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Contact CaterHub</p>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(28px, 4vw, 44px)', color: '#111318', marginBottom: 12 }}>How can we help?</h1>
        <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Choose the fastest support path or send our team a message. We'll route it to the right person.
        </p>
      </section>

      {/* Quick paths */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-3">
          {CONTACT_PATHS.map(({ Icon, title, desc }) => (
            <div key={title} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', cursor: 'pointer' }} className="hover:border-gray-300 transition-colors">
              <div className="flex items-start gap-4">
                <div style={{ width: 40, height: 40, background: '#FFF5F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color="#B84922" strokeWidth={1.75} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#111318', marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55 }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div style={{ flex: 1 }}>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '32px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Send a Message</p>
                <h2 style={{ fontWeight: 800, fontSize: 26, color: '#111318', marginBottom: 6 }}>Tell us what you need</h2>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>Fields marked required help us route and answer your request faster.</p>

                {success ? (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBFCCD', borderRadius: 12, padding: 28, textAlign: 'center' }}>
                    <CheckCircle size={36} color="#16A34A" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 700, fontSize: 18, color: '#16A34A', marginBottom: 8 }}>Message sent!</p>
                    <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>General support replies within 1 business day. Time-sensitive event issues are prioritized.</p>
                    <button onClick={() => setSuccess(false)} style={{ background: '#B84922', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Full name <span style={{ color: '#B84922' }}>*</span></label>
                      <input required placeholder="Enter full name" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#B84922'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Email address <span style={{ color: '#B84922' }}>*</span></label>
                      <input required type="email" placeholder="Enter email address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#B84922'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>I'm contacting you about <span style={{ color: '#B84922' }}>*</span></label>
                      <select required value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', background: '#fff', color: form.topic ? '#111318' : '#9CA3AF' }}>
                        <option value="">Select a topic</option>
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Event or business name</label>
                      <input placeholder="Optional reference" value={form.eventName} onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#B84922'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Message <span style={{ color: '#B84922' }}>*</span></label>
                      <textarea required rows={5} placeholder="Include dates, guest count, location, and any helpful context..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', resize: 'vertical' }}
                        onFocus={e => e.target.style.borderColor = '#B84922'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                    </div>
                    <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.55 }}>By submitting, you agree that CaterHub may contact you about this inquiry.</p>
                    {error && <p style={{ fontSize: 13, color: '#DC2626', background: '#FFF5F5', padding: '10px 14px', borderRadius: 7 }}>{error}</p>}
                    <button type="submit" disabled={submitting}
                      style={{ background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, padding: '13px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content', opacity: submitting ? 0.8 : 1 }}>
                      <Send size={15} /> {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside style={{ width: '100%', maxWidth: 300, flexShrink: 0 }}>
              <div style={{ background: '#1C1F2B', borderRadius: 14, padding: '24px', marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 12 }}>What to expect</p>
                <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.65, marginBottom: 16 }}>General support replies within 1 business day. Time-sensitive event issues are prioritized when you include your event date.</p>
                <div className="flex items-center gap-2" style={{ color: '#B84922' }}>
                  <Clock size={14} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Monday–Friday: 9:00–18:00</span>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '24px' }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#111318', marginBottom: 12 }}>Prefer email?</p>
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={14} color="#B84922" />
                  <span style={{ fontSize: 13, color: '#B84922', fontWeight: 600 }}>support@caterhub.example</span>
                </div>
                <div className="flex items-center gap-2 mb-16">
                  <Mail size={14} color="#B84922" />
                  <span style={{ fontSize: 13, color: '#B84922', fontWeight: 600 }}>partners@caterhub.example</span>
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.65 }}>For changes to account booking, contact your caterer directly first—inquiry and contact are handled off the platform.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#fff', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }} className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick Answers</p>
          <h2 style={{ fontWeight: 800, fontSize: 26, color: '#111318', marginBottom: 8 }}>Frequently asked questions</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>The essentials before you reach out.</p>
          <div className="flex flex-col">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} style={{ borderTop: '1px solid #E5E7EB' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: '#111318' }}>{item.q}</p>
                  {openFaq === i ? <Minus size={18} color="#9CA3AF" /> : <Plus size={18} color="#9CA3AF" />}
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 18 }}>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65 }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
            <div style={{ borderTop: '1px solid #E5E7EB' }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#F6F6FA' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111318', marginBottom: 6 }}>Ready to start planning?</h3>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Discover verified caterers, compare packages, and inquire directly in minutes.</p>
          </div>
          <Link to="/caterers" style={{ background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, padding: '13px 28px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
            Browse Caterers <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
