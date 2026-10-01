export type Role = 'customer' | 'caterer';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  pricePerGuest: number;
  minGuests: number;
}

export interface PackageInput {
  name: string;
  description: string;
  pricePerGuest: number;
  minGuests: number;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  content: string;
  eventType: string;
}

export interface Caterer {
  id: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  areas: string[];
  minSpend: number;
  capacityMin: number;
  capacityMax: number;
  responseTime: string;
  rating: number;
  reviewCount: number;
  eventTypes: string[];
  serviceStyles: string[];
  verified: boolean;
  available: boolean;
  imageUrl: string;
  gallery: string[];
  features: string[];
  phone: string;
  packages: Package[];
  reviews: Review[];
}

/** What a caterer can edit on their own profile. */
export interface ProfileInput {
  name: string;
  tagline: string;
  description: string;
  location: string;
  phone: string;
  areas: string[];
  minSpend: number;
  capacityMin: number;
  capacityMax: number;
  responseTime: string;
  eventTypes: string[];
  serviceStyles: string[];
  features: string[];
  available: boolean;
  imageUrl: string;
  extraPhotos: string[];
}

export interface ListingStatus {
  live: boolean;
  missing: string[];
}

export type InquiryStatus = 'new' | 'read' | 'replied' | 'booked' | 'declined' | 'archived';

export interface Inquiry {
  id?: string;
  catererId: string;
  catererName: string;
  customerName: string;
  customerEmail: string;
  eventDate: string;
  guestCount: number;
  eventType: string;
  message: string;
  status?: InquiryStatus;
  createdAt?: string;
}

export interface ContactMessage {
  id?: string;
  fullName: string;
  email: string;
  topic: string;
  eventName?: string;
  message: string;
  createdAt?: string;
}
