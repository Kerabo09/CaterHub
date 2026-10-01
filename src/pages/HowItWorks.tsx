import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F6F6FA' }}>
      <section style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', textAlign: 'center', padding: '60px 24px 48px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#B84922', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Simple & Transparent</p>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(30px, 5vw, 52px)', color: '#111318', marginBottom: 14, lineHeight: 1.1 }}>How CaterHub Works</h1>
        <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          We organize discovery and initial contact, so you can focus on your event—without platform markups or hidden fees.
        </p>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-12">
            {[
              {
                n: '01', title: 'Discover & Filter',
                desc: "Browse verified caterers by location, guest count, budget, and event type. Every profile is complete—packages, service styles, response time, minimum spend, and real photos—so you're never guessing.",
                img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=380&fit=crop&auto=format',
              },
              {
                n: '02', title: 'Send Free Inquiries',
                desc: 'Message caterers directly with your event details. Specific dates are prioritized. No middlemen, no hidden platform markups—your inquiry goes directly to the caterer\'s booking manager.',
                img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=380&fit=crop&auto=format',
              },
              {
                n: '03', title: 'Finalize Directly',
                desc: 'Communicate directly, receive quotes, agree on terms, and book—all through your direct relationship with the caterer. CaterHub never takes a commission.',
                img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=380&fit=crop&auto=format',
              },
            ].map((step, i) => (
              <div key={step.n} className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 items-center`}>
                <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', maxWidth: 460 }}>
                  <img src={step.img} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 48, color: '#F3F4F6', lineHeight: 1, marginBottom: -8 }}>{step.n}</p>
                  <h2 style={{ fontWeight: 800, fontSize: 'clamp(22px, 3vw, 30px)', color: '#111318', marginBottom: 14 }}>{step.title}</h2>
                  <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#F6F6FA', borderTop: '1px solid #E5E7EB' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111318', marginBottom: 6 }}>Ready to find your caterer?</h3>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Browse 180+ verified catering businesses now.</p>
          </div>
          <Link to="/caterers" style={{ background: '#B84922', color: '#fff', fontWeight: 700, fontSize: 14, padding: '13px 28px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
            Browse Caterers <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
