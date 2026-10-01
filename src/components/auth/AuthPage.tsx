import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { IdCapture } from './IdCapture';
import { PhotoField } from '../PhotoField';
import { useAuth } from '../../lib/AuthContext';
import { api, NeedsConfirmation } from '../../lib/api';
import { EVENT_TYPES, SERVICE_STYLES } from '../../lib/options';
import type { Role } from '../../types';

type Mode = 'login' | 'signup' | 'change' | 'forgot';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

const ID_TYPES = [
  'Driver’s license',
  'Passport',
  'National ID (PhilSys)',
  'UMID',
  'Postal ID',
  'Voter’s ID',
  'Other government ID',
];

const COPY = {
  customer: {
    tag: 'Customer inquiry access',
    loginTitle: 'Log in to send your inquiry',
    loginSub: 'Continue your conversation with a caterer and keep every event detail in one place.',
    signupTitle: 'Create your customer account',
    signupSub: 'Verify once, then send inquiries to any caterer for free.',
    nameLabel: 'Full name',
    namePh: 'Juan Dela Cruz',
    emailLabel: 'Email address',
    emailPh: 'you@example.com',
    loginBtn: 'Log in and continue',
    signupBtn: 'Create account',
    altText: 'New to CaterHub?',
    altLink: 'Create a customer account',
    altTo: '/signup',
    loginTo: '/login',
    home: '/caterers',
    img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1000&h=1000&fit=crop&auto=format',
    heroBadge: 'Your event, one step closer',
    heroTitle: 'Pick up right where you left off.',
    heroText: 'Return to your saved caterers, inquiry details, and direct responses without starting over.',
  },
  caterer: {
    tag: 'Caterer partner portal',
    loginTitle: 'Welcome back, partner',
    loginSub: 'Log in to manage your CaterHub business profile and respond to inquiries.',
    signupTitle: 'List your catering business',
    signupSub: 'Verify your identity once. No commission fees, ever.',
    nameLabel: 'Business name',
    namePh: 'Savor & Gather Co.',
    emailLabel: 'Business email',
    emailPh: 'you@yourcateringbusiness.com',
    loginBtn: 'Log in',
    signupBtn: 'Join CaterHub',
    altText: 'New to CaterHub?',
    altLink: 'Join CaterHub',
    altTo: '/partner-signup',
    loginTo: '/partner-login',
    home: '/dashboard',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1000&h=1000&fit=crop&auto=format',
    heroBadge: 'Caterer partner portal',
    heroTitle: 'Keep every opportunity moving.',
    heroText: 'Review new inquiries, update menus and availability, and respond to customers from one focused workspace.',
  },
} as const;

export function AuthPage({ role, initialMode }: { role: Role; initialMode: 'login' | 'signup' }) {
  const c = COPY[role];
  const navigate = useNavigate();
  const location = useLocation();
  const { logIn, signUp } = useAuth();
  const from = (location.state as { from?: string } | null)?.from;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [codeStep, setCodeStep] = useState(false); // forgot password: false = ask for email, true = enter code

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [idImage, setIdImage] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Caterer business profile (collected at signup)
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [location_, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [areasText, setAreasText] = useState('');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [serviceStyles, setServiceStyles] = useState<string[]>([]);
  const [cover, setCover] = useState('');

  const go = (m: Mode) => {
    setMode(m); setCodeStep(false); setError(''); setNotice('');
    setPassword(''); setConfirm(''); setNewPassword(''); setCode('');
  };

  const resend = async () => {
    setError(''); setNotice('');
    try {
      await api.forgotPassword(email.trim());
      setNotice('We sent a new code. If you just asked for one, wait a minute before requesting another.');
    } catch (err) { setError(errMsg(err)); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setNotice('');

    if (mode === 'signup') {
      if (password.length < 8) return setError('Choose a password with at least 8 characters.');
      if (password !== confirm) return setError('The two passwords don’t match.');
      if (!idImage) return setError('Take a photo of your ID to verify your account.');
      if (role === 'caterer' && !location_.trim()) return setError('Add your business location so customers can find you.');
    }
    if (mode === 'change') {
      if (newPassword.length < 8) return setError('The new password needs at least 8 characters.');
      if (newPassword === password) return setError('Choose a new password that is different from your current one.');
    }
    if (mode === 'forgot' && codeStep) {
      if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from your email.');
      if (newPassword.length < 8) return setError('The new password needs at least 8 characters.');
      if (newPassword !== confirm) return setError('The two passwords don’t match.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await logIn(email, password, role, remember);
        navigate(user.role === 'caterer' ? '/dashboard' : (from ?? c.home));
      } else if (mode === 'signup') {
        const profile = role === 'caterer' ? {
          tagline: tagline.trim(), description: description.trim(), location: location_.trim(), phone: phone.trim(),
          areas: areasText.split(',').map(s => s.trim()).filter(Boolean), eventTypes, serviceStyles,
        } : undefined;
        const user = await signUp({ role, name, email, password, idType, idImage, profile });
        if (user.role === 'caterer') {
          let photoFailed = false;
          if (cover) {
            try {
              const { url } = await api.uploadImage(cover);
              const { caterer } = await api.getProfile();
              await api.saveProfile({
                name: caterer.name, tagline: caterer.tagline, description: caterer.description, location: caterer.location,
                phone: caterer.phone, areas: caterer.areas, minSpend: caterer.minSpend, capacityMin: caterer.capacityMin || 1,
                capacityMax: caterer.capacityMax || 100, responseTime: caterer.responseTime || '24 hours',
                eventTypes: caterer.eventTypes, serviceStyles: caterer.serviceStyles, features: caterer.features,
                available: caterer.available, imageUrl: url, extraPhotos: [],
              });
            } catch { photoFailed = true; }
          }
          navigate('/dashboard', { state: { welcome: true, photoFailed } });
        } else {
          navigate(from ?? c.home);
        }
      } else if (mode === 'change') {
        await api.changePassword(email.trim(), password, newPassword);
        go('login');
        setNotice('Password changed. Log in with your new password.');
      } else if (!codeStep) {
        await api.forgotPassword(email.trim());
        setCodeStep(true);
        setNotice(`If an account exists for ${email.trim()}, a 6-digit code is on its way. Check your inbox (and spam).`);
      } else {
        await api.resetPassword(email.trim(), code.trim(), newPassword);
        go('login');
        setNotice('Password updated. Log in with your new password.');
      }
    } catch (err) {
      if (err instanceof NeedsConfirmation) { go('login'); setNotice(err.message); }
      else setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'login' ? c.loginTitle :
    mode === 'signup' ? c.signupTitle :
    mode === 'change' ? 'Change your password' : codeStep ? 'Enter your code' : 'Reset your password';
  const sub =
    mode === 'login' ? c.loginSub :
    mode === 'signup' ? c.signupSub :
    mode === 'change' ? 'Enter your current password, then choose a new one.' :
    codeStep ? 'Type the 6-digit code we emailed you, then choose a new password.' :
    'Enter your email and we’ll send a 6-digit code to your Gmail so you can set a new password.';
  const button =
    mode === 'login' ? c.loginBtn :
    mode === 'signup' ? c.signupBtn :
    mode === 'change' ? 'Update password' : codeStep ? 'Set new password' : 'Send code';

  const pwToggle = (
    <button type="button" className="field-toggle" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className={`auth-page ${role === 'caterer' ? 'auth-hero-left' : ''}`}>
      <section className="auth-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url(${c.img})` }}>
        <span className="auth-hero-badge">{c.heroBadge}</span>
        <div>
          <h2>{c.heroTitle}</h2>
          <p>{c.heroText}</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <Link to="/" className="auth-back"><ArrowLeft size={14} /> Back to CaterHub</Link>
          <span className="auth-pill"><i /> {c.tag}</span>
          <h1>{title}</h1>
          <p className="auth-sub">{sub}</p>

          {notice && <p className="auth-notice" role="status"><CheckCircle2 size={16} /> {notice}</p>}

          <form onSubmit={submit} noValidate={false}>
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="name">{c.nameLabel}</label>
                <div className="field-wrap">
                  {role === 'caterer' ? <Building2 size={16} /> : <User size={16} />}
                  <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={c.namePh} autoComplete={role === 'caterer' ? 'organization' : 'name'} required />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">{c.emailLabel}</label>
              <div className="field-wrap">
                <Mail size={16} />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={c.emailPh} autoComplete="email" required readOnly={mode === 'forgot' && codeStep} />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="field">
                <label htmlFor="password">{mode === 'change' ? 'Current password' : 'Password'}</label>
                <div className="field-wrap">
                  <Lock size={16} />
                  <input id="password" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />
                  {pwToggle}
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <div className="field-wrap">
                  <Lock size={16} />
                  <input id="confirm" type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" required />
                </div>
              </div>
            )}

            {mode === 'forgot' && codeStep && (
              <>
                <div className="field">
                  <label htmlFor="code">6-digit code</label>
                  <div className="field-plain">
                    <input id="code" className="code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="newpw2">New password</label>
                  <div className="field-wrap">
                    <KeyRound size={16} />
                    <input id="newpw2" type={show ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" required />
                    {pwToggle}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="confirm2">Confirm new password</label>
                  <div className="field-wrap">
                    <Lock size={16} />
                    <input id="confirm2" type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your new password" autoComplete="new-password" required />
                  </div>
                </div>
                <p className="field-hint">Didn’t get it? <button type="button" className="link-btn" onClick={resend}>Send a new code</button></p>
              </>
            )}

            {mode === 'change' && (
              <div className="field">
                <label htmlFor="newpw">New password</label>
                <div className="field-wrap">
                  <Lock size={16} />
                  <input id="newpw" type={show ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" required />
                </div>
              </div>
            )}

            {mode === 'signup' && role === 'caterer' && (
              <fieldset className="field sub-block">
                <legend>Your business profile</legend>
                <p className="field-hint">Customers see this on your public page. You can edit everything later in your dashboard.</p>
                <div className="field field-plain">
                  <label htmlFor="b-tag">Tagline</label>
                  <input id="b-tag" value={tagline} onChange={e => setTagline(e.target.value)} maxLength={160} placeholder="Filipino fiesta catering for every occasion" />
                </div>
                <div className="field field-plain">
                  <label htmlFor="b-loc">Main location *</label>
                  <input id="b-loc" value={location_} onChange={e => setLocation(e.target.value)} maxLength={160} placeholder="Calbayog City, Samar" required />
                </div>
                <div className="field field-plain">
                  <label htmlFor="b-phone">Contact number</label>
                  <input id="b-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={40} placeholder="0917 123 4567" autoComplete="tel" />
                </div>
                <div className="field field-plain">
                  <label htmlFor="b-areas">Areas you serve</label>
                  <input id="b-areas" value={areasText} onChange={e => setAreasText(e.target.value)} placeholder="Calbayog, Catbalogan, Tacloban (comma separated)" />
                </div>
                <div className="field">
                  <label htmlFor="b-desc">About your business</label>
                  <textarea id="b-desc" rows={4} value={description} onChange={e => setDescription(e.target.value)} maxLength={3000}
                    placeholder="Tell customers about your food, your experience and what makes you different (20+ characters to go live)." />
                </div>
                <div className="field">
                  <label>Events you cater</label>
                  <div className="chips">
                    {EVENT_TYPES.map(t => (
                      <button type="button" key={t} className={`chip ${eventTypes.includes(t) ? 'on' : ''}`} aria-pressed={eventTypes.includes(t)}
                        onClick={() => setEventTypes(toggle(eventTypes, t))}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Service styles</label>
                  <div className="chips">
                    {SERVICE_STYLES.map(t => (
                      <button type="button" key={t} className={`chip ${serviceStyles.includes(t) ? 'on' : ''}`} aria-pressed={serviceStyles.includes(t)}
                        onClick={() => setServiceStyles(toggle(serviceStyles, t))}>{t}</button>
                    ))}
                  </div>
                </div>
                <PhotoField label="Cover photo (optional)" hint="Shown at the top of your page. You can add it later." value={cover}
                  onSelect={d => setCover(d)} onClear={() => setCover('')} />
              </fieldset>
            )}

            {mode === 'signup' && (
              <fieldset className="field id-block">
                <legend>Verification ID</legend>
                <p className="field-hint">We use this photo only to confirm who you are.</p>
                <div className="field-wrap select-wrap">
                  <select id="idtype" value={idType} onChange={e => setIdType(e.target.value)} aria-label="ID type">
                    {ID_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <IdCapture value={idImage} onChange={setIdImage} />
              </fieldset>
            )}

            {mode === 'login' && (
              <div className="auth-row">
                <label className="check">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me
                </label>
                <div className="auth-links">
                  <button type="button" onClick={() => go('forgot')}>Forgot password?</button>
                  <button type="button" onClick={() => go('change')}>Change password</button>
                </div>
              </div>
            )}

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" className="btn-primary btn-block" disabled={loading}>
              {loading ? 'Please wait…' : <>{button} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-foot">
            {mode === 'login' && (
              <p>{c.altText} <Link to={c.altTo}>{c.altLink}</Link></p>
            )}
            {mode === 'signup' && (
              <p>Already have an account? <Link to={c.loginTo}>Log in</Link></p>
            )}
            {(mode === 'change' || mode === 'forgot') && (
              <p><button type="button" className="link-btn" onClick={() => go('login')}>Back to log in</button></p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
