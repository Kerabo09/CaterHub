import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, Users, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { INQUIRY_STATUS_LABEL } from '../../lib/options';
import type { Inquiry } from '../../types';

export function MyInquiries() {
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myInquiries().then(r => setItems(r.inquiries)).catch(e => setError(e instanceof Error ? e.message : 'Could not load your inquiries.'));
  }, []);

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>My inquiries</h1>
          <p>Every request you’ve sent to a caterer, and where it stands.</p>
        </div>
        <Link to="/caterers" className="btn-primary">Find caterers</Link>
      </div>

      <div className="dcard" style={{ marginTop: 22 }}>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {!items && !error && <div style={{ display: 'grid', placeItems: 'center', padding: 30 }}><Loader2 className="spin" color="#B84922" /></div>}
        {items && items.length === 0 && (
          <div className="empty"><strong>No inquiries yet</strong>Open a caterer’s page and send a free inquiry. It will show up here.</div>
        )}
        {items?.map(i => (
          <div className="inq" key={i.id}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to={`/caterers/${i.catererId}`} style={{ fontWeight: 700, fontSize: 15, color: '#111318' }}>{i.catererName}</Link>
              <span className={`tag ${i.status}`}>{INQUIRY_STATUS_LABEL[i.status ?? 'new']}</span>
            </div>
            <div className="inq-meta">
              {i.eventDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Calendar size={13} /> {i.eventDate}</span>}
              {i.guestCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {i.guestCount} guests</span>}
              {i.eventType && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {i.eventType}</span>}
              {i.createdAt && <span style={{ color: '#9CA3AF' }}>Sent {new Date(i.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            </div>
            {i.message && <p className="inq-msg">{i.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
