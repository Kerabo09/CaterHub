import type { Role } from '../../types';

/** Photos for the auth screens. Drop your own files into /public/images to override the online fallbacks. */
export const AUTH_IMAGES = {
  customer: ['/images/auth-customer.jpg', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&h=1200&fit=crop&auto=format'],
  caterer: ['/images/auth-caterer.jpg', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=1200&fit=crop&auto=format'],
} as const;

export const ID_TYPES = [
  'Driver’s license', 'Passport', 'National ID (PhilSys)', 'UMID', 'Postal ID', 'Voter’s ID', 'Other government ID',
];

export interface RoleCopy {
  pill: string;
  loginTitle: string;
  loginSub: string;
  signupTitle: string;
  signupSub: string;
  nameLabel: string;
  namePh: string;
  emailLabel: string;
  emailPh: string;
  loginBtn: string;
  signupBtn: string;
  altText: string;
  altLink: string;
  altTo: string;
  loginTo: string;
  loginLink: string;
  home: string;
  footerLabel: string;
  signupNote: string;
  hero: {
    badge: string;
    title: string;
    text: string;
  };
  loginHero: {
    badge: string;
    title: string;
    text: string;
  };
}

export const COPY: Record<Role, RoleCopy> = {
  customer: {
    pill: 'Customer inquiry access',
    loginTitle: 'Welcome back',
    loginSub: 'Log in to continue your conversations with caterers and keep every event detail in one place.',
    signupTitle: 'Create your customer account',
    signupSub: 'Save caterers, send inquiries, and keep every event conversation in one private place.',
    nameLabel: 'Full name',
    namePh: 'Your full name',
    emailLabel: 'Email address',
    emailPh: 'you@example.com',
    loginBtn: 'Log in and Continue',
    signupBtn: 'Create Account and Continue',
    altText: 'New to CaterHub?',
    altLink: 'Create a customer account',
    altTo: '/signup',
    loginTo: '/login',
    loginLink: 'Customer log in',
    home: '/caterers',
    footerLabel: 'Customer Account · Inquiry access',
    signupNote: 'Free to use · Your event details stay private',
    hero: {
      badge: 'Your event, one step closer',
      title: 'Your event plans deserve one easy home.',
      text: 'Save trusted caterers, share your brief once, and compare direct responses without losing a detail.',
    },
    loginHero: {
      badge: 'Your event, one step closer',
      title: 'Pick up right where you left off.',
      text: 'Return to your saved caterers, inquiry details, and direct responses without starting over.',
    },
  },
  caterer: {
    pill: 'New caterer partner',
    loginTitle: 'Welcome back, partner',
    loginSub: 'Log in to manage your CaterHub business profile and respond to customer inquiries.',
    signupTitle: 'Grow with CaterHub',
    signupSub: 'Tell us about your business. We’ll review your details before your profile goes live.',
    nameLabel: 'Business name',
    namePh: 'Savor & Gather Co.',
    emailLabel: 'Business email',
    emailPh: 'you@yourcateringbusiness.com',
    loginBtn: 'Log in',
    signupBtn: 'Create Partner Account',
    altText: 'New to CaterHub?',
    altLink: 'Create a partner account',
    altTo: '/partner-signup',
    loginTo: '/partner-login',
    loginLink: 'Caterer log in',
    home: '/dashboard',
    footerLabel: 'Caterer Partner Account',
    signupNote: 'Already verified? Use your partner credentials',
    hero: {
      badge: 'Caterer partner portal',
      title: 'Turn great events into lasting growth.',
      text: 'Create your profile, share what makes your catering distinct, and start receiving direct customer inquiries.',
    },
    loginHero: {
      badge: 'Caterer partner portal',
      title: 'Keep every opportunity moving.',
      text: 'Review new inquiries, update menus and availability, and respond to customers from one focused workspace.',
    },
  },
};

export const CATERER_STATS = [
  { value: 'Direct', label: 'Customer inquiries' },
  { value: '0%', label: 'CaterHub commission' },
  { value: 'Verified', label: 'Partner network' },
];
