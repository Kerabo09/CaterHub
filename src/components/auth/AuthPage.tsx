import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Diamond, Eye, EyeOff, MapPin } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { IdCapture } from './IdCapture';
import { COPY, ID_TYPES } from './content';
import { PhotoField } from '../common/PhotoField';
import { useAuth } from '../../lib/AuthContext';
import { api, NeedsConfirmation } from '../../lib/api';
import { EVENT_TYPES, SERVICE_STYLES } from '../../lib/options';
import type { Role } from '../../types';

type Mode = 'login' | 'signup' | 'change' | 'forgot';
type Step = 'details' | 'verify';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

function Field({ id, label, optional, children }: { id: string; label: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="f">
      <label htmlFor={id}>{label}{optional && <span className="f-opt"> (optional)</span>}</label>
      {children}
    </div>
  );
}

export function AuthPage({ role, initialMode }: { role: Role; initialMode: 'login' | 'signup' }) {
  const c = COPY[role];
  const isPartner = role === 'caterer';
  const navigate = useNavigate();
  const location = useLocation();
  const { logIn, signUp } = useAuth();
  const from = (location.state as { from?: string } | null)?.from;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>('details');
  const [codeStep, setCodeStep] = useState(false); // forgot password: false = ask for email, true = enter code

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Verification step
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [idImage, setIdImage] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [serviceStyles, setServiceStyles] = useState<string[]>([]);
  const [cover, setCover] = useState('');

  const go = (m: Mode) => {
    setMode(m); setStep('details'); setCodeStep(false); setError(''); setNotice('');
    setPassword(''); setConfirm(''); setNewPassword(''); setCode('');
  };

  const resend = async () => {
    setError(''); setNotice('');
    try {
      await api.forgotPassword(email.trim());
      setNotice('We sent a new code. If you just asked for one, wait a minute before requesting another.');
    } catch (err) { setError(errMsg(err)); }
  };

  const createAccount = async () => {
    const profile = isPartner ? {
      tagline: tagline.trim(), description: description.trim(), location: area.trim(), phone: phone.trim(),
      areas: [area.trim()].filter(Boolean), eventTypes, serviceStyles, contactName: contactName.trim(),
    } : undefined;
    const user = await signUp({ role, name, email, password, idType, idImage, phone: phone.trim(), contactName: contactName.trim(), profile });

    if (user.role !== 'caterer') return navigate(from ?? c.home);

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
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setNotice('');

    if (mode === 'signup' && step === 'details') {
      if (name.trim().length < 2) return setError(isPartner ? 'Enter your business name.' : 'Enter your full name.');
      if (isPartner && contactName.trim().length < 2) return setError('Enter the name of the main contact person.');
      if (isPartner && !area.trim()) return setError('Add your service area so customers can find you.');
      if (password.length < 8) return setError('Choose a password with at least 8 characters.');
      if (!agree) return setError('Please accept the Terms and Privacy Policy to continue.');
      return setStep('verify');
    }
    if (mode === 'signup' && !idImage) return setError('Take or upload a photo of your ID to verify your account.');
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
        await createAccount();
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

  const verifying = mode === 'signup' && step === 'verify';
  const pill = verifying ? 'Step 2 of 2 · Verification' : mode === 'signup' || mode === 'login' ? c.pill : 'Account recovery';
  const title =
    verifying ? 'Verify your identity' :
    mode === 'login' ? c.loginTitle :
    mode === 'signup' ? c.signupTitle :
    mode === 'change' ? 'Change your password' : codeStep ? 'Enter your code' : 'Reset your password';
  const sub =
    verifying ? 'We use this photo only to confirm who you are. It is stored privately and never shown on your profile.' :
    mode === 'login' ? c.loginSub :
    mode === 'signup' ? c.signupSub :
    mode === 'change' ? 'Enter your current password, then choose a new one.' :
    codeStep ? 'Type the 6-digit code we emailed you, then choose a new password.' :
    'Enter your email and we’ll send a 6-digit code so you can set a new password.';
  const button =
    verifying ? c.signupBtn :
    mode === 'login' ? c.loginBtn :
    mode === 'signup' ? (isPartner ? c.signupBtn : c.signupBtn) :
    mode === 'change' ? 'Update password' : codeStep ? 'Set new password' : 'Send code';

  const pwToggle = (
    <button type="button" className="f-toggle" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
  const pwInput = (id: string, value: string, set: (v: string) => void, ph: string, auto: string) => (
    <div className="f-wrap">
      <input id={id} className="f-input" type={show ? 'text' : 'password'} value={value} onChange={e => set(e.target.value)} placeholder={ph} autoComplete={auto} required />
      {pwToggle}
    </div>
  );

  return (
    <AuthShell role={role} mode={mode === 'signup' ? 'signup' : 'login'}>
      <div className="auth-card">
        <span className="auth-pill"><Diamond size={8} fill="currentColor" strokeWidth={0} /> {pill}</span>
        <h1>{title}</h1>
        <p className="auth-sub">{sub}</p>

        {notice && <p className="auth-notice" role="status"><CheckCircle2 size={16} /> {notice}</p>}

        <form onSubmit={submit}>
          {/* ---------- Sign-up, step 1: account details (matches the design) ---------- */}
          {mode === 'signup' && step === 'details' && (
            <>
              {isPartner ? (
                <div className="f-row">
                  <Field id="name" label={c.nameLabel}>
                    <input id="name" className="f-input" value={name} onChange={e => setName(e.target.value)} placeholder={c.namePh} autoComplete="organization" required />
                  </Field>
                  <Field id="contact" label="Contact name">
                    <input id="contact" className="f-input" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Your full name" autoComplete="name" required />
                  </Field>
                </div>
              ) : (
                <Field id="name" label={c.nameLabel}>
                  <input id="name" className="f-input" value={name} onChange={e => setName(e.target.value)} placeholder={c.namePh} autoComplete="name" required />
                </Field>
              )}

              <Field id="email" label={c.emailLabel}>
                <input id="email" className="f-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={c.emailPh} autoComplete="email" required />
              </Field>

              {isPartner ? (
                <div className="f-row">
                  <Field id="area" label="Service area">
                    <div className="f-wrap">
                      <input id="area" className="f-input" value={area} onChange={e => setArea(e.target.value)} placeholder="City or region" autoComplete="address-level2" required />
                      <MapPin size={15} className="f-icon" aria-hidden="true" />
                    </div>
                  </Field>
                  <Field id="phone" label="Phone number">
                    <input id="phone" className="f-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000–0000" autoComplete="tel" />
                  </Field>
                </div>
              ) : (
                <Field id="phone" label="Phone number" optional>
                  <input id="phone" className="f-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000–0000" autoComplete="tel" />
                </Field>
              )}

              <Field id="password" label="Create password">
                {pwInput('password', password, setPassword, 'At least 8 characters', 'new-password')}
              </Field>

              <label className="f-check">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
                <span>
                  I agree to CaterHub’s <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
                  {isPartner ? ', including partner verification.' : '.'}
                </span>
              </label>
            </>
          )}

          {/* ---------- Sign-up, step 2: identity + optional business profile ---------- */}
          {verifying && (
            <>
              <div className="f">
                <label htmlFor="idtype">ID type</label>
                <select id="idtype" className="f-input f-select" value={idType} onChange={e => setIdType(e.target.value)}>
                  {ID_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <IdCapture value={idImage} onChange={setIdImage} />

              {isPartner && (
                <fieldset className="f-group">
                  <legend>Business profile <span className="f-opt">(optional, editable later)</span></legend>
                  <Field id="b-tag" label="Tagline">
                    <input id="b-tag" className="f-input" value={tagline} onChange={e => setTagline(e.target.value)} maxLength={160} placeholder="Filipino fiesta catering for every occasion" />
                  </Field>
                  <Field id="b-desc" label="About your business">
                    <textarea id="b-desc" className="f-input f-area" rows={4} value={description} onChange={e => setDescription(e.target.value)} maxLength={3000}
                      placeholder="Describe your food and experience. 20+ characters are needed before your listing can go live." />
                  </Field>
                  <div className="f">
                    <span className="f-label">Events you cater</span>
                    <div className="chips">
                      {EVENT_TYPES.map(t => (
                        <button type="button" key={t} className={`chip ${eventTypes.includes(t) ? 'on' : ''}`} aria-pressed={eventTypes.includes(t)}
                          onClick={() => setEventTypes(toggle(eventTypes, t))}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="f">
                    <span className="f-label">Service styles</span>
                    <div className="chips">
                      {SERVICE_STYLES.map(t => (
                        <button type="button" key={t} className={`chip ${serviceStyles.includes(t) ? 'on' : ''}`} aria-pressed={serviceStyles.includes(t)}
                          onClick={() => setServiceStyles(toggle(serviceStyles, t))}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <PhotoField label="Cover photo (optional)" hint="Shown at the top of your page." value={cover}
                    onSelect={d => setCover(d)} onClear={() => setCover('')} />
                </fieldset>
              )}
            </>
          )}

          {/* ---------- Log in ---------- */}
          {mode === 'login' && (
            <>
              <Field id="email" label={c.emailLabel}>
                <input id="email" className="f-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={c.emailPh} autoComplete="email" required />
              </Field>
              <Field id="password" label="Password">
                {pwInput('password', password, setPassword, 'Enter your password', 'current-password')}
              </Field>
              <div className="auth-row">
                <label className="f-check f-check-inline">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <div className="auth-links">
                  <button type="button" onClick={() => go('forgot')}>Forgot password?</button>
                  <button type="button" onClick={() => go('change')}>Change password</button>
                </div>
              </div>
            </>
          )}

          {/* ---------- Change password ---------- */}
          {mode === 'change' && (
            <>
              <Field id="email" label={c.emailLabel}>
                <input id="email" className="f-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={c.emailPh} autoComplete="email" required />
              </Field>
              <Field id="password" label="Current password">
                {pwInput('password', password, setPassword, 'Enter your current password', 'current-password')}
              </Field>
              <Field id="newpw" label="New password">
                {pwInput('newpw', newPassword, setNewPassword, 'At least 8 characters', 'new-password')}
              </Field>
            </>
          )}

          {/* ---------- Forgot password ---------- */}
          {mode === 'forgot' && (
            <>
              <Field id="email" label={c.emailLabel}>
                <input id="email" className="f-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={c.emailPh} autoComplete="email" required readOnly={codeStep} />
              </Field>
              {codeStep && (
                <>
                  <Field id="code" label="6-digit code">
                    <input id="code" className="f-input f-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" required />
                  </Field>
                  <Field id="newpw2" label="New password">
                    {pwInput('newpw2', newPassword, setNewPassword, 'At least 8 characters', 'new-password')}
                  </Field>
                  <Field id="confirm2" label="Confirm new password">
                    <input id="confirm2" className="f-input" type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your new password" autoComplete="new-password" required />
                  </Field>
                  <p className="f-hint">Didn’t get it? <button type="button" className="link-btn" onClick={resend}>Send a new code</button></p>
                </>
              )}
            </>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : <>{button} <ArrowRight size={15} /></>}
          </button>
          {verifying && (
            <button type="button" className="auth-back" onClick={() => { setStep('details'); setError(''); }}>
              <ArrowLeft size={14} /> Back to account details
            </button>
          )}
        </form>

        <div className="auth-foot">
          {(mode === 'signup' && !verifying) && (
            <>
              <p>Already have an account? <Link to={c.loginTo}>{c.loginLink} <ArrowRight size={12} /></Link></p>
              <small>{c.signupNote}</small>
            </>
          )}
          {mode === 'login' && <p>{c.altText} <Link to={c.altTo}>{c.altLink} <ArrowRight size={12} /></Link></p>}
          {(mode === 'change' || mode === 'forgot') && (
            <p><button type="button" className="link-btn" onClick={() => go('login')}>Back to log in</button></p>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
