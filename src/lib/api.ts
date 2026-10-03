import type { PostgrestError, AuthError, User as SbUser } from '@supabase/supabase-js';
import { supabase, setRemember } from './supabase';
import type {
  Caterer, Inquiry, ContactMessage, InquiryStatus, ListingStatus, Package, PackageInput, ProfileInput, Role, User,
} from '../types';

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&auto=format';

// Photos live in Supabase Storage and are stored as full public URLs, so nothing to rewrite.
export const assetUrl = (u: string) => u;
export const storedUrl = (u: string) => u;

const NETWORK_MSG = 'Cannot reach the server. Please check your connection and try again.';

/** Turns any Supabase error into a message a customer can act on. */
function fail(e: PostgrestError | AuthError | { message: string; code?: string; status?: number } | null | undefined, fallback = 'Something went wrong. Please try again.'): never {
  const msg = e?.message ?? '';
  const code = (e as { code?: string } | null)?.code ?? '';
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) throw new Error(NETWORK_MSG);
  if (/invalid login credentials/i.test(msg)) throw new Error('Email or password is incorrect.');
  if (/already registered|already been registered|user_already_exists/i.test(msg + code)) throw new Error('An account with this email already exists. Log in instead.');
  if (/email not confirmed/i.test(msg)) throw new Error('Please confirm your email first: open the link we sent you, then log in.');
  if (/rate limit|too many|over_email_send_rate_limit|over_request_rate_limit/i.test(msg + code)) throw new Error('Too many attempts. Please wait a few minutes and try again.');
  if (/password should be at least|weak_password/i.test(msg + code)) throw new Error('Choose a stronger password (at least 8 characters).');
  if (/invalid email|email_address_invalid/i.test(msg + code)) throw new Error('Please enter a valid email address.');
  if (/database error saving new user/i.test(msg)) throw new Error('We couldn’t create your account. Check your details and try again.');
  if (/token has expired or is invalid|otp_expired|invalid.*(token|otp)/i.test(msg + code)) throw new Error('That code is incorrect or has expired. Request a new one.');
  if (/row-level security|permission denied|42501/i.test(msg + code)) throw new Error('You don’t have permission to do that. Please log in again.');
  if (/jwt expired|not authenticated/i.test(msg)) throw new Error('Your session has expired. Please log in again.');
  throw new Error(msg && !/^\s*\{/.test(msg) ? msg : fallback);
}

async function uid(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) fail(error);
  const id = data.session?.user.id;
  if (!id) throw new Error('Please log in to continue.');
  return id;
}

// ---------- helpers ----------
type Row = Record<string, any>;

function normalize(c: Partial<Caterer>): Caterer {
  const gallery = c.gallery ?? [];
  const imageUrl = c.imageUrl || gallery[0] || FALLBACK_PHOTO;
  return {
    id: c.id ?? '', name: c.name ?? '', tagline: c.tagline ?? '', description: c.description ?? '',
    location: c.location ?? '', areas: c.areas ?? [], minSpend: c.minSpend ?? 0,
    capacityMin: c.capacityMin ?? 0, capacityMax: c.capacityMax ?? 0, responseTime: c.responseTime ?? '',
    rating: c.rating ?? 0, reviewCount: c.reviewCount ?? 0, eventTypes: c.eventTypes ?? [],
    serviceStyles: c.serviceStyles ?? [], verified: !!c.verified, available: c.available !== false,
    imageUrl, gallery: gallery.length ? gallery : [imageUrl], features: c.features ?? [],
    phone: c.phone ?? '', packages: c.packages ?? [], reviews: c.reviews ?? [],
  };
}

const mapPackage = (r: Row): Package => ({
  id: r.id, name: r.name, description: r.description ?? '', pricePerGuest: r.price_per_guest, minGuests: r.min_guests,
});

function mapCaterer(r: Row): Caterer {
  const pk = [...(r.packages ?? [])].sort((a: Row, b: Row) => (a.sort_order - b.sort_order) || String(a.created_at).localeCompare(String(b.created_at)));
  const rv = [...(r.reviews ?? [])].sort((a: Row, b: Row) => String(b.created_at).localeCompare(String(a.created_at)));
  return normalize({
    id: r.id, name: r.name, tagline: r.tagline, description: r.description, location: r.location,
    areas: r.areas ?? [], minSpend: r.min_spend, capacityMin: r.capacity_min, capacityMax: r.capacity_max,
    responseTime: r.response_time, rating: Number(r.rating), reviewCount: r.review_count,
    eventTypes: r.event_types ?? [], serviceStyles: r.service_styles ?? [], verified: r.verified,
    available: r.available, imageUrl: r.image_url, gallery: r.gallery ?? [], features: r.features ?? [],
    phone: r.phone ?? '',
    packages: pk.map(mapPackage),
    reviews: rv.map((x: Row) => ({ id: x.id, reviewerName: x.reviewer_name, rating: x.rating, content: x.content, eventType: x.event_type ?? '' })),
  });
}

const mapInquiry = (r: Row): Inquiry => ({
  id: r.id, catererId: r.caterer_id, catererName: r.caterer_name, customerName: r.customer_name,
  customerEmail: r.customer_email, eventDate: r.event_date ?? '', guestCount: r.guest_count,
  eventType: r.event_type, message: r.message, status: r.status, createdAt: r.created_at,
});

const CATERER_SELECT = '*, packages(*), reviews(*)';

function listingOf(c: { description: string; location: string; packages: unknown[] }): ListingStatus {
  const missing: string[] = [];
  if ((c.description ?? '').length < 20) missing.push('Write a description (at least 20 characters)');
  if (!c.location) missing.push('Add your location');
  if (c.packages.length === 0) missing.push('Add at least one package');
  return { live: missing.length === 0, missing };
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; type: string; ext: string } {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl ?? '');
  if (!m) throw new Error('Upload a JPG, PNG or WebP image.');
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (bytes.length > 1_900_000) throw new Error('That image is too large (about 1.9 MB maximum). Try a smaller photo.');
  return { blob: new Blob([bytes], { type: m[1] }), type: m[1], ext: m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg' };
}

// ---------- ID photo (private bucket, only the owner and project admins can read it) ----------
const pendingKey = (userId: string) => `caterhub.pendingId.${userId}`;

async function uploadId(userId: string, dataUrl: string): Promise<void> {
  const { blob } = dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage.from('id-verification')
    .upload(`${userId}/id.jpg`, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
}

/** If an ID photo couldn't be sent at sign-up (e.g. email confirmation was required first), send it now. */
async function flushPendingId(userId: string) {
  try {
    const pending = localStorage.getItem(pendingKey(userId));
    if (!pending) return;
    await uploadId(userId, pending);
    localStorage.removeItem(pendingKey(userId));
  } catch { /* try again next login */ }
}

async function loadUser(sb: SbUser): Promise<User> {
  const { data, error } = await supabase.from('profiles').select('id, role, name, email').eq('id', sb.id).maybeSingle();
  if (error) fail(error);
  if (!data) {
    // Account exists in Supabase Auth but has no CaterHub profile (database setup not finished).
    throw new Error('Your account is missing its profile. Ask the site owner to run the latest database migration (003).');
  }
  return data as User;
}

export interface CaterersResponse { caterers: Caterer[]; total: number }
export interface CatererFilters { q?: string; eventType?: string; minGuests?: number; maxBudget?: number }

export interface CatererSignupProfile {
  tagline?: string; description?: string; location?: string; phone?: string;
  areas?: string[]; eventTypes?: string[]; serviceStyles?: string[]; contactName?: string;
}
export interface SignUpInput {
  role: Role;
  name: string;
  email: string;
  password: string;
  idType: string;
  idImage: string; // JPEG data URL
  phone?: string;
  contactName?: string;
  profile?: CatererSignupProfile;
}
export interface AuthResult { user: User }

/** Thrown when sign-up worked but Supabase wants the email confirmed before the first login. */
export class NeedsConfirmation extends Error {}

export const api = {
  // ----- public catalogue -----
  getCaterers: async (filters?: CatererFilters): Promise<CaterersResponse> => {
    const { data, error } = await supabase.from('caterers').select(CATERER_SELECT)
      .eq('is_active', true).order('rating', { ascending: false }).order('name', { ascending: true });
    if (error) fail(error);
    let list = (data ?? []).map(mapCaterer);
    const q = (filters?.q ?? '').trim().toLowerCase();
    // Match on the first word so "Weddings" matches "Weddings & Nuptials".
    const et = (filters?.eventType ?? '').toLowerCase().split(/[\s&,]+/)[0] ?? '';
    if (q) list = list.filter(x => [x.name, x.tagline, x.location, ...x.areas].join(' ').toLowerCase().includes(q));
    if (et) list = list.filter(x => x.eventTypes.some(e => e.toLowerCase().includes(et)));
    if (filters?.minGuests) list = list.filter(x => x.capacityMax >= filters.minGuests!);
    if (filters?.maxBudget) list = list.filter(x => x.minSpend <= filters.maxBudget!);
    return { caterers: list, total: list.length };
  },
  getCaterer: async (id: string): Promise<{ caterer: Caterer }> => {
    const { data, error } = await supabase.from('caterers').select(CATERER_SELECT).eq('id', id).eq('is_active', true).maybeSingle();
    if (error) {
      if (error.code === '22P02') throw new Error('Caterer not found');
      fail(error);
    }
    if (!data) throw new Error('Caterer not found');
    return { caterer: mapCaterer(data) };
  },
  submitContact: async (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    const fullName = msg.fullName.trim();
    if (!fullName) throw new Error('Please enter your name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(msg.email.trim())) throw new Error('Please enter a valid email address.');
    if (!msg.message.trim()) throw new Error('Please enter a message');
    const { error } = await supabase.from('contact_messages').insert({
      full_name: fullName.slice(0, 120), email: msg.email.trim().toLowerCase(), topic: (msg.topic ?? '').slice(0, 120),
      event_name: (msg.eventName ?? '').slice(0, 160), message: msg.message.trim().slice(0, 5000),
    });
    if (error) fail(error);
    return { message: { ...msg }, success: true };
  },

  // ----- accounts (Supabase Auth) -----
  signUp: async (input: SignUpInput, remember = true): Promise<AuthResult> => {
    const name = input.name.trim();
    if (name.length < 2) throw new Error(input.role === 'caterer' ? 'Enter your business name.' : 'Enter your full name.');
    if (input.password.length < 8) throw new Error('Choose a password with at least 8 characters.');
    if (!input.idImage) throw new Error('Take a photo of your ID to verify your account.');
    setRemember(remember);

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      // The database trigger turns this into the profile (and, for caterers, the business listing).
      options: { data: { role: input.role, name, id_type: input.idType, phone: input.phone ?? '', contact_name: input.contactName ?? '', profile: input.role === 'caterer' ? input.profile ?? {} : {} } },
    });
    if (error) fail(error);
    // With "Confirm email" on, Supabase hides duplicates by returning a user with no identities.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Log in instead.');
    }
    if (!data.user) throw new Error('We couldn’t create your account. Please try again.');

    if (!data.session) {
      // Email confirmation is switched on in Supabase: keep the ID photo and send it after the first login.
      try { localStorage.setItem(pendingKey(data.user.id), input.idImage); } catch { /* ignore */ }
      throw new NeedsConfirmation(`Almost there! We sent a confirmation link to ${input.email.trim()}. Open it, then log in.`);
    }
    try { await uploadId(data.user.id, input.idImage); }
    catch { try { localStorage.setItem(pendingKey(data.user.id), input.idImage); } catch { /* ignore */ } }

    return { user: await loadUser(data.user) };
  },
  logIn: async (email: string, password: string, role: Role, remember = true): Promise<AuthResult> => {
    setRemember(remember);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) fail(error);
    const user = await loadUser(data.user);
    if ((role === 'customer' || role === 'caterer') && role !== user.role) {
      await supabase.auth.signOut();
      throw new Error(user.role === 'caterer'
        ? 'This email belongs to a caterer account. Use the Caterer login.'
        : 'This email belongs to a customer account. Use the Customer login.');
    }
    void flushPendingId(user.id);
    return { user };
  },
  me: async (): Promise<{ user: User | null }> => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return { user: null };
    try { return { user: await loadUser(data.session.user) }; } catch { return { user: null }; }
  },
  logOut: async () => { await supabase.auth.signOut(); },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    // Same answer whether or not the account exists, so emails can't be probed.
    if (error && /rate limit|too many/i.test(error.message)) fail(error);
    if (error && /failed to fetch/i.test(error.message)) fail(error);
    return { ok: true, message: 'If an account exists for that email, a 6-digit code is on its way.' };
  },
  resetPassword: async (email: string, code: string, newPassword: string) => {
    if (newPassword.length < 8) throw new Error('Choose a password with at least 8 characters.');
    const v = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'recovery' });
    if (v.error) fail(v.error);
    const u = await supabase.auth.updateUser({ password: newPassword });
    if (u.error) { await supabase.auth.signOut(); fail(u.error); }
    await supabase.auth.signOut();
    return { ok: true, message: 'Password updated. You can log in now.' };
  },
  changePassword: async (email: string, currentPassword: string, newPassword: string) => {
    if (newPassword === currentPassword) throw new Error('Choose a new password that is different from your current one.');
    const s = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: currentPassword });
    if (s.error) {
      if (/invalid login/i.test(s.error.message)) throw new Error('Email or current password is incorrect.');
      fail(s.error);
    }
    const u = await supabase.auth.updateUser({ password: newPassword });
    if (u.error) fail(u.error);
    await supabase.auth.signOut();
    return { ok: true };
  },

  // ----- customer (must be logged in) -----
  submitInquiry: async (inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) => {
    const userId = await uid();
    if (inquiry.eventDate && Number.isNaN(Date.parse(inquiry.eventDate))) throw new Error('Invalid event date');
    const { data, error } = await supabase.from('inquiries').insert({
      caterer_id: inquiry.catererId, caterer_name: inquiry.catererName, customer_id: userId,
      customer_name: inquiry.customerName.trim().slice(0, 120) || 'Customer',
      customer_email: inquiry.customerEmail.trim().toLowerCase(),
      event_date: inquiry.eventDate || null, guest_count: Math.max(0, inquiry.guestCount || 0),
      event_type: (inquiry.eventType ?? '').slice(0, 120), message: (inquiry.message ?? '').slice(0, 3000),
    }).select().single();
    if (error) fail(error);
    return { inquiry: mapInquiry(data), success: true };
  },
  myInquiries: async () => {
    const userId = await uid();
    const { data, error } = await supabase.from('inquiries').select('*').eq('customer_id', userId)
      .order('created_at', { ascending: false }).limit(200);
    if (error) fail(error);
    return { inquiries: (data ?? []).map(mapInquiry) };
  },
  addReview: async (d: { catererId: string; reviewerName: string; rating: number; content: string; eventType: string }) => {
    const rating = Math.round(Number(d.rating));
    if (!(rating >= 1 && rating <= 5)) throw new Error('Rating must be between 1 and 5');
    if (!d.content.trim()) throw new Error('Please write a review');
    const { error } = await supabase.from('reviews').insert({
      caterer_id: d.catererId, reviewer_name: (d.reviewerName || 'Customer').trim().slice(0, 80),
      rating, content: d.content.trim().slice(0, 2000), event_type: (d.eventType ?? '').slice(0, 120),
    });
    if (error) fail(error);
    return { success: true };
  },

  // ----- caterer dashboard -----
  getProfile: async (): Promise<{ caterer: Caterer; listing: ListingStatus }> => {
    const userId = await uid();
    const { data, error } = await supabase.from('caterers').select(CATERER_SELECT).eq('owner_id', userId).maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('No caterer profile found for this account.');
    const caterer = mapCaterer(data);
    return { caterer, listing: listingOf(caterer) };
  },
  saveProfile: async (p: ProfileInput): Promise<{ caterer: Caterer; listing: ListingStatus }> => {
    const userId = await uid();
    const name = p.name.trim();
    if (name.length < 2) throw new Error('Enter your business name (at least 2 characters).');
    const phone = p.phone.trim();
    if (phone && !/^[0-9+()\-.\s]{6,40}$/.test(phone)) throw new Error('Enter a valid phone number (digits, spaces, + ( ) - only).');
    const whole = (v: unknown, min: number, max: number, label: string) => {
      const n = Math.floor(Number(v));
      if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label} must be a whole number between ${min.toLocaleString('en-US')} and ${max.toLocaleString('en-US')}.`);
      return n;
    };
    const minSpend = whole(p.minSpend || 0, 0, 100_000_000, 'Minimum spend');
    const capacityMin = whole(p.capacityMin || 1, 1, 100_000, 'Minimum guests');
    const capacityMax = whole(p.capacityMax || Math.max(100, capacityMin), 1, 100_000, 'Maximum guests');
    if (capacityMax < capacityMin) throw new Error('Maximum guests can’t be smaller than minimum guests.');

    const cover = p.imageUrl || p.extraPhotos[0] || '';
    const gallery = [...new Set([cover, ...p.extraPhotos].filter(Boolean))];

    const { error } = await supabase.from('caterers').update({
      name, tagline: p.tagline.trim().slice(0, 160), description: p.description.trim().slice(0, 3000),
      location: p.location.trim().slice(0, 160), phone, areas: p.areas.slice(0, 12),
      min_spend: minSpend, capacity_min: capacityMin, capacity_max: capacityMax,
      response_time: (p.responseTime || '24 hours').slice(0, 40), event_types: p.eventTypes, service_styles: p.serviceStyles,
      features: p.features.slice(0, 10), available: p.available, image_url: cover, gallery,
    }).eq('owner_id', userId);
    if (error) fail(error);
    await supabase.from('profiles').update({ name }).eq('id', userId);

    // Best effort: delete photos this caterer uploaded but no longer uses.
    try {
      const keep = new Set(gallery.map(u => decodeURIComponent(u.split('/').pop() ?? '')));
      const { data: files } = await supabase.storage.from('caterer-photos').list(userId, { limit: 100 });
      const stale = (files ?? []).filter(f => !keep.has(f.name)).map(f => `${userId}/${f.name}`);
      if (stale.length) await supabase.storage.from('caterer-photos').remove(stale);
    } catch { /* ignore */ }

    return api.getProfile();
  },
  uploadImage: async (dataUrl: string): Promise<{ url: string }> => {
    const userId = await uid();
    const { blob, type, ext } = dataUrlToBlob(dataUrl);
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('caterer-photos').upload(path, blob, { contentType: type, cacheControl: '31536000' });
    if (error) fail(error, 'Could not upload that photo.');
    return { url: supabase.storage.from('caterer-photos').getPublicUrl(path).data.publicUrl };
  },
  addPackage: async (p: PackageInput) => {
    const userId = await uid();
    const { data: cat, error: ce } = await supabase.from('caterers').select('id').eq('owner_id', userId).maybeSingle();
    if (ce) fail(ce);
    if (!cat) throw new Error('No caterer profile found for this account.');
    const name = p.name.trim();
    if (name.length < 2) throw new Error('Give the package a name (at least 2 characters).');
    const { data: last } = await supabase.from('packages').select('sort_order').eq('caterer_id', cat.id)
      .order('sort_order', { ascending: false }).limit(1);
    const { data, error } = await supabase.from('packages').insert({
      caterer_id: cat.id, name: name.slice(0, 80), description: (p.description ?? '').slice(0, 600),
      price_per_guest: Math.floor(p.pricePerGuest), min_guests: Math.max(1, Math.floor(p.minGuests || 1)),
      sort_order: (last?.[0]?.sort_order ?? 0) + 1,
    }).select().single();
    if (error) fail(error);
    const { listing } = await api.getProfile();
    return { package: mapPackage(data), listing };
  },
  updatePackage: async (id: string, p: PackageInput) => {
    const name = p.name.trim();
    if (name.length < 2) throw new Error('Give the package a name (at least 2 characters).');
    const { data, error } = await supabase.from('packages').update({
      name: name.slice(0, 80), description: (p.description ?? '').slice(0, 600),
      price_per_guest: Math.floor(p.pricePerGuest), min_guests: Math.max(1, Math.floor(p.minGuests || 1)),
    }).eq('id', id).select().maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('Package not found.');
    return { package: mapPackage(data) };
  },
  deletePackage: async (id: string) => {
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) fail(error);
    const { listing } = await api.getProfile();
    return { ok: true, listing };
  },
  partnerInquiries: async () => {
    const userId = await uid();
    const { data: cat } = await supabase.from('caterers').select('id').eq('owner_id', userId).maybeSingle();
    if (!cat) return { inquiries: [] as Inquiry[] };
    const { data, error } = await supabase.from('inquiries').select('*').eq('caterer_id', cat.id)
      .order('created_at', { ascending: false }).limit(200);
    if (error) fail(error);
    return { inquiries: (data ?? []).map(mapInquiry) };
  },
  setInquiryStatus: async (id: string, status: InquiryStatus) => {
    const { data, error } = await supabase.from('inquiries').update({ status }).eq('id', id).select().maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('Inquiry not found.');
    return { inquiry: mapInquiry(data) };
  },
};
