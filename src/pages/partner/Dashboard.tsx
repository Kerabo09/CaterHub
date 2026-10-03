import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2, Package as PackageIcon, Inbox, CheckCircle2, AlertCircle, ExternalLink, Plus, Pencil, Trash2, Loader2, Mail, Calendar, Users, MapPin,
} from 'lucide-react';
import { api, assetUrl, storedUrl } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { PhotoField } from '../../components/common/PhotoField';
import { EVENT_TYPES, SERVICE_STYLES, RESPONSE_TIMES, INQUIRY_STATUS_LABEL } from '../../lib/options';
import type { Caterer, Inquiry, InquiryStatus, ListingStatus, Package, PackageInput, ProfileInput } from '../../types';

type Tab = 'profile' | 'packages' | 'inquiries';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;
const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const welcome = (location.state as { welcome?: boolean; photoFailed?: boolean } | null) ?? {};

  const [tab, setTab] = useState<Tab>('profile');
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [listing, setListing] = useState<ListingStatus | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    const r = await api.getProfile();
    setCaterer(r.caterer);
    setListing(r.listing);
  }, []);

  useEffect(() => {
    loadProfile().catch(e => setError(errMsg(e)));
    api.partnerInquiries().then(r => setInquiries(r.inquiries)).catch(() => {});
  }, [loadProfile]);

  if (error) return <div className="dash"><p className="auth-error" role="alert">{error}</p></div>;
  if (!caterer || !listing) {
    return <div className="dash" style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><Loader2 className="spin" color="#B84922" /></div>;
  }

  const newCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>{welcome.welcome ? `Welcome, ${caterer.name}!` : caterer.name}</h1>
          <p>Signed in as {user?.email}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className={`status-pill ${listing.live ? 'live' : 'draft'}`}>
            {listing.live ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {listing.live ? 'Live on CaterHub' : 'Draft – not public yet'}
          </span>
          {listing.live && (
            <Link to={`/caterers/${caterer.id}`} className="icon-btn" target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> View public page
            </Link>
          )}
        </div>
      </div>

      {welcome.welcome && !listing.live && (
        <p className="auth-notice" role="status" style={{ marginTop: 18 }}>
          <CheckCircle2 size={16} /> Your account is ready. Add your first package to publish your listing.
        </p>
      )}
      {welcome.photoFailed && (
        <p className="auth-error" role="alert" style={{ marginTop: 18 }}>Your profile photo didn’t upload. You can add it again in the Profile tab.</p>
      )}

      {!listing.live && listing.missing.length > 0 && (
        <div className="dcard" style={{ marginTop: 18, background: '#FEFCE8', borderColor: '#FDE68A' }}>
          <strong style={{ fontSize: 14, color: '#854D0E' }}>To go live, finish these steps:</strong>
          <ul className="checklist">
            {listing.missing.map(m => <li key={m}><AlertCircle size={14} /> {m}</li>)}
          </ul>
        </div>
      )}

      <div className="dash-tabs" role="tablist">
        <button className={`dash-tab ${tab === 'profile' ? 'active' : ''}`} role="tab" aria-selected={tab === 'profile'} onClick={() => setTab('profile')}><Building2 size={16} /> Profile</button>
        <button className={`dash-tab ${tab === 'packages' ? 'active' : ''}`} role="tab" aria-selected={tab === 'packages'} onClick={() => setTab('packages')}><PackageIcon size={16} /> Packages &amp; offers</button>
        <button className={`dash-tab ${tab === 'inquiries' ? 'active' : ''}`} role="tab" aria-selected={tab === 'inquiries'} onClick={() => setTab('inquiries')}>
          <Inbox size={16} /> Inquiries {newCount > 0 && <span className="dash-count">{newCount}</span>}
        </button>
      </div>

      {tab === 'profile' && <ProfileTab caterer={caterer} onSaved={(c, l) => { setCaterer(c); setListing(l); }} />}
      {tab === 'packages' && <PackagesTab packages={caterer.packages} onChanged={loadProfile} />}
      {tab === 'inquiries' && <InquiriesTab inquiries={inquiries} setInquiries={setInquiries} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter(x => x !== v) : [...list, v];
}

function ProfileTab({ caterer, onSaved }: { caterer: Caterer; onSaved: (c: Caterer, l: ListingStatus) => void }) {
  const cover = storedUrl(caterer.imageUrl);
  const [f, setF] = useState<ProfileInput>({
    name: caterer.name,
    tagline: caterer.tagline,
    description: caterer.description,
    location: caterer.location,
    phone: caterer.phone,
    areas: caterer.areas,
    minSpend: caterer.minSpend,
    capacityMin: caterer.capacityMin || 1,
    capacityMax: caterer.capacityMax || 100,
    responseTime: caterer.responseTime || '24 hours',
    eventTypes: caterer.eventTypes,
    serviceStyles: caterer.serviceStyles,
    features: caterer.features,
    available: caterer.available,
    imageUrl: cover,
    extraPhotos: caterer.gallery.map(storedUrl).filter(u => u && u !== cover).slice(0, 2),
  });
  // Free-text lists are edited as text and split on save.
  const [areasText, setAreasText] = useState(caterer.areas.join(', '));
  const [featuresText, setFeaturesText] = useState(caterer.features.join('\n'));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) => { setF(p => ({ ...p, [k]: v })); setSaved(false); };

  const upload = async (dataUrl: string) => (await api.uploadImage(dataUrl)).url;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaved(false);
    if (f.name.trim().length < 2) return setError('Enter your business name.');
    setSaving(true);
    try {
      const payload: ProfileInput = {
        ...f,
        areas: areasText.split(',').map(s => s.trim()).filter(Boolean),
        features: featuresText.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const r = await api.saveProfile(payload);
      onSaved(r.caterer, r.listing);
      setSaved(true);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <div className="dcard">
        <h2>Business profile</h2>
        <p className="dsub">This is the first thing customers see on your public page.</p>
        <div className="dgrid">
          <div className="dfield">
            <label htmlFor="p-name">Business name</label>
            <input id="p-name" value={f.name} onChange={e => set('name', e.target.value)} maxLength={120} required />
          </div>
          <div className="dfield">
            <label htmlFor="p-phone">Contact number</label>
            <input id="p-phone" type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} maxLength={40} placeholder="0917 123 4567" />
          </div>
          <div className="dfield full">
            <label htmlFor="p-tag">Tagline</label>
            <input id="p-tag" value={f.tagline} onChange={e => set('tagline', e.target.value)} maxLength={160} placeholder="One line that sells your catering" />
          </div>
          <div className="dfield full">
            <label htmlFor="p-desc">About your business</label>
            <textarea id="p-desc" value={f.description} onChange={e => set('description', e.target.value)} rows={5} maxLength={3000}
              placeholder="Your story, your specialties, what clients love about you." />
          </div>
          <div className="dfield">
            <label htmlFor="p-loc">Main location</label>
            <input id="p-loc" value={f.location} onChange={e => set('location', e.target.value)} maxLength={160} placeholder="City, Province" />
          </div>
          <div className="dfield">
            <label htmlFor="p-areas">Areas you serve</label>
            <input id="p-areas" value={areasText} onChange={e => { setAreasText(e.target.value); setSaved(false); }} placeholder="Calbayog, Catbalogan, Tacloban" />
            <p className="field-hint">Separate with commas.</p>
          </div>
        </div>
      </div>

      <div className="dcard">
        <h2>Photos</h2>
        <p className="dsub">Good photos get more inquiries. JPG, PNG or WebP.</p>
        <div className="dgrid">
          <PhotoField label="Cover photo" value={assetUrl(f.imageUrl)}
            onSelect={async d => set('imageUrl', await upload(d))} onClear={() => set('imageUrl', '')} />
          {[0, 1].map(i => (
            <PhotoField key={i} label={`Extra photo ${i + 1}`} value={assetUrl(f.extraPhotos[i] ?? '')}
              onSelect={async d => {
                const url = await upload(d);
                const next = [...f.extraPhotos]; next[i] = url;
                set('extraPhotos', next.filter(Boolean));
              }}
              onClear={() => set('extraPhotos', f.extraPhotos.filter((_, idx) => idx !== i))} />
          ))}
        </div>
      </div>

      <div className="dcard">
        <h2>What you offer</h2>
        <p className="dsub">Customers filter by these, so pick everything that applies.</p>
        <div className="dfield" style={{ marginBottom: 18 }}>
          <span className="dlabel">Events you cater</span>
          <div className="chips">
            {EVENT_TYPES.map(t => (
              <button type="button" key={t} className={`chip ${f.eventTypes.includes(t) ? 'on' : ''}`} aria-pressed={f.eventTypes.includes(t)}
                onClick={() => set('eventTypes', toggle(f.eventTypes, t))}>{t}</button>
            ))}
          </div>
        </div>
        <div className="dfield" style={{ marginBottom: 18 }}>
          <span className="dlabel">Service styles</span>
          <div className="chips">
            {SERVICE_STYLES.map(t => (
              <button type="button" key={t} className={`chip ${f.serviceStyles.includes(t) ? 'on' : ''}`} aria-pressed={f.serviceStyles.includes(t)}
                onClick={() => set('serviceStyles', toggle(f.serviceStyles, t))}>{t}</button>
            ))}
          </div>
        </div>
        <div className="dfield">
          <label htmlFor="p-feat">Highlights</label>
          <textarea id="p-feat" value={featuresText} onChange={e => { setFeaturesText(e.target.value); setSaved(false); }} rows={4}
            placeholder={'Free food tasting\nUniformed service staff\nTable and chair rental'} />
          <p className="field-hint">One per line (up to 10).</p>
        </div>
      </div>

      <div className="dcard">
        <h2>Capacity &amp; availability</h2>
        <p className="dsub">Helps customers know if you’re the right fit.</p>
        <div className="dgrid">
          <div className="dfield">
            <label htmlFor="p-cmin">Smallest event (guests)</label>
            <input id="p-cmin" type="number" min={1} value={f.capacityMin} onChange={e => set('capacityMin', Number(e.target.value))} />
          </div>
          <div className="dfield">
            <label htmlFor="p-cmax">Largest event (guests)</label>
            <input id="p-cmax" type="number" min={1} value={f.capacityMax} onChange={e => set('capacityMax', Number(e.target.value))} />
          </div>
          <div className="dfield">
            <label htmlFor="p-spend">Minimum spend (₱)</label>
            <input id="p-spend" type="number" min={0} step={500} value={f.minSpend} onChange={e => set('minSpend', Number(e.target.value))} />
          </div>
          <div className="dfield">
            <label htmlFor="p-resp">You usually reply within</label>
            <select id="p-resp" value={f.responseTime} onChange={e => set('responseTime', e.target.value)}>
              {[...new Set([...RESPONSE_TIMES, f.responseTime])].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <label className="check full" style={{ fontSize: 14 }}>
            <input type="checkbox" checked={f.available} onChange={e => set('available', e.target.checked)} />
            I’m currently accepting new bookings
          </label>
        </div>
      </div>

      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="dbar">
        <span className="toast" role="status" style={{ visibility: saved ? 'visible' : 'hidden' }}><CheckCircle2 size={16} /> Profile saved</span>
        <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: 150 }}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Packages                                                            */
/* ------------------------------------------------------------------ */

const EMPTY_PKG = { name: '', description: '', pricePerGuest: '', minGuests: '' };
type PkgForm = typeof EMPTY_PKG;

function PackagesTab({ packages, onChanged }: { packages: Package[]; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<PkgForm>(EMPTY_PKG);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const open = (p?: Package) => {
    setError('');
    setEditing(p ? p.id : 'new');
    setForm(p ? { name: p.name, description: p.description, pricePerGuest: String(p.pricePerGuest), minGuests: String(p.minGuests) } : EMPTY_PKG);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload: PackageInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      pricePerGuest: Math.floor(Number(form.pricePerGuest)),
      minGuests: form.minGuests ? Math.floor(Number(form.minGuests)) : 1,
    };
    if (payload.name.length < 2) return setError('Give the package a name.');
    if (!(payload.pricePerGuest >= 1)) return setError('Enter the price per guest.');
    setBusy(true);
    try {
      if (editing === 'new') await api.addPackage(payload);
      else if (editing) await api.updatePackage(editing, payload);
      await onChanged();
      setEditing(null);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Package) => {
    if (!window.confirm(`Delete “${p.name}”? Customers will no longer see it.`)) return;
    try { await api.deletePackage(p.id); await onChanged(); } catch (err) { setError(errMsg(err)); }
  };

  const formUi = (
    <form onSubmit={submit} className="dcard" style={{ background: '#FCFCFD' }}>
      <h2>{editing === 'new' ? 'New package' : 'Edit package'}</h2>
      <p className="dsub">Describe what’s included so customers can compare at a glance.</p>
      <div className="dgrid">
        <div className="dfield full">
          <label htmlFor="k-name">Package name</label>
          <input id="k-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={80} placeholder="Classic Fiesta Buffet" required autoFocus />
        </div>
        <div className="dfield full">
          <label htmlFor="k-desc">What’s included</label>
          <textarea id="k-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} maxLength={600}
            placeholder="Four mains, two sides, rice, dessert and drinks." />
        </div>
        <div className="dfield">
          <label htmlFor="k-price">Price per guest (₱)</label>
          <input id="k-price" type="number" min={1} value={form.pricePerGuest} onChange={e => setForm(f => ({ ...f, pricePerGuest: e.target.value }))} placeholder="450" required />
        </div>
        <div className="dfield">
          <label htmlFor="k-min">Minimum guests</label>
          <input id="k-min" type="number" min={1} value={form.minGuests} onChange={e => setForm(f => ({ ...f, minGuests: e.target.value }))} placeholder="30" />
        </div>
      </div>
      {error && <p className="auth-error" role="alert" style={{ marginTop: 16, marginBottom: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : editing === 'new' ? 'Add package' : 'Save changes'}</button>
        <button type="button" className="btn-secondary" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
      </div>
    </form>
  );

  return (
    <>
      {editing === 'new' && formUi}

      <div className="dcard">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2>Your packages &amp; offers</h2>
            <p className="dsub" style={{ marginBottom: 0 }}>These appear on your public page. You can list up to 20.</p>
          </div>
          {editing !== 'new' && <button className="btn-primary" onClick={() => open()}><Plus size={16} /> Add package</button>}
        </div>

        {packages.length === 0 && editing !== 'new' && (
          <div className="empty"><strong>No packages yet</strong>Add your first package to publish your listing.</div>
        )}

        {packages.map(p => (
          editing === p.id ? <div key={p.id} style={{ marginTop: 14 }}>{formUi}</div> : (
            <div className="pkg-row" key={p.id}>
              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111318' }}>{p.name}</h3>
                {p.description && <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginTop: 3 }}>{p.description}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="pkg-price">{peso(p.pricePerGuest)}<span style={{ fontSize: 12.5, fontWeight: 500, color: '#9CA3AF' }}> / guest</span></div>
                <div style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 10px' }}>Min. {p.minGuests} guests</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="icon-btn" onClick={() => open(p)}><Pencil size={13} /> Edit</button>
                  <button className="icon-btn danger" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}><Trash2 size={13} /> Delete</button>
                </div>
              </div>
            </div>
          )
        ))}
        {error && editing === null && <p className="auth-error" role="alert" style={{ marginTop: 12, marginBottom: 0 }}>{error}</p>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Inquiries                                                           */
/* ------------------------------------------------------------------ */

function InquiriesTab({ inquiries, setInquiries }: { inquiries: Inquiry[]; setInquiries: (i: Inquiry[]) => void }) {
  const [error, setError] = useState('');

  const change = async (inq: Inquiry, status: InquiryStatus) => {
    if (!inq.id) return;
    setError('');
    const before = inquiries;
    setInquiries(inquiries.map(i => (i.id === inq.id ? { ...i, status } : i)));
    try { await api.setInquiryStatus(inq.id, status); }
    catch (err) { setInquiries(before); setError(errMsg(err)); }
  };

  return (
    <div className="dcard">
      <h2>Customer inquiries</h2>
      <p className="dsub">Reply to customers by email, then update the status to keep track.</p>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {inquiries.length === 0 ? (
        <div className="empty"><strong>No inquiries yet</strong>When a customer contacts you from your public page, it shows up here and in your email.</div>
      ) : inquiries.map(i => (
        <div className="inq" key={i.id}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: 15 }}>{i.customerName}</strong>{' '}
              <span className={`tag ${i.status}`}>{INQUIRY_STATUS_LABEL[i.status ?? 'new']}</span>
            </div>
            <select aria-label="Inquiry status" value={i.status} onChange={e => change(i, e.target.value as InquiryStatus)}
              style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '7px 10px', fontSize: 13, fontWeight: 600, background: '#fff' }}>
              {Object.entries(INQUIRY_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="inq-meta">
            <a href={`mailto:${i.customerEmail}?subject=${encodeURIComponent('Your CaterHub inquiry')}`} style={{ color: '#B84922', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Mail size={13} /> {i.customerEmail}</a>
            {i.eventDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Calendar size={13} /> {i.eventDate}</span>}
            {i.guestCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {i.guestCount} guests</span>}
            {i.eventType && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {i.eventType}</span>}
            {i.createdAt && <span style={{ color: '#9CA3AF' }}>Received {new Date(i.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          </div>
          {i.message && <p className="inq-msg">{i.message}</p>}
        </div>
      ))}
    </div>
  );
}
