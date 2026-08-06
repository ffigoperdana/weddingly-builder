import { z } from 'zod';
import {
  WEDDING_TEMPLATE_IDS,
  type WeddingTemplateId,
} from './templates';

export const storyTimelineItemSchema = z.object({
  id: z.string().optional(),
  year: z.string().min(1, 'Year is required'),
  title: z.string().min(1, 'Timeline title is required'),
  text: z.string().min(1, 'Timeline description is required'),
});

export const bankAccountSchema = z.object({
  id: z.string().optional(),
  bank: z.string().min(1, 'Bank name is required'),
  number: z.string().min(1, 'Account number is required'),
  owner: z.string().min(1, 'Account owner is required'),
});

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

// Global Styles Schema
export const globalStylesSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  headingFont: z.string().min(1, 'Heading font is required'),
  bodyFont: z.string().min(1, 'Body font is required'),
});

// Hero Section Schema
export const heroSectionSchema = z.object({
  heroEnabled: z.boolean(),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  weddingDate: z.date().optional().nullable(),
  heroImageUrl: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
});

// Event Schema
export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Event title is required'),
  date: z.date({ required_error: 'Event date is required' }),
  time: z.string().min(1, 'Event time is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
});

// Story Section Schema
export const storySectionSchema = z.object({
  storyEnabled: z.boolean(),
  storyTitle: z.string().min(1, 'Story title is required'),
  storyText: z.string().optional(),
  storyImage1Url: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
  storyImage2Url: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
});

// Gallery Section Schema
export const gallerySectionSchema = z.object({
  galleryEnabled: z.boolean(),
  galleryTitle: z.string().min(1, 'Gallery title is required'),
  galleryImages: z
    .array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed'),
});

// Registry Section Schema
export const registrySectionSchema = z.object({
  registryEnabled: z.boolean(),
  registryTitle: z.string().min(1, 'Registry title is required'),
  registryText: z.string().optional(),
});

// Music Section Schema
export const musicSectionSchema = z.object({
  musicEnabled: z.boolean(),
  musicUrl: z.string().optional(),
  musicTitle: z.string().optional(),
  musicArtist: z.string().optional(),
});

// Publishing Settings Schema
export const publishingSchema = z.object({
  slug: z.string().optional(),
  password: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// Complete Wedding Site Schema
export const weddingSiteSchema = z.object({
  // Template
  templateId: z.enum(WEDDING_TEMPLATE_IDS).default('classic'),

  // Global Styles
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  headingFont: z.string(),
  bodyFont: z.string(),

  // Hero Section
  heroEnabled: z.boolean(),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  weddingDate: z.date().optional().nullable(),
  heroImageUrl: z.string().optional(),

  // Optional Couple Details Section
  coupleDetailsEnabled: z.boolean().default(false),
  brideFullName: z.string().optional(),
  brideParents: z.string().optional(),
  bridePhotoUrl: z.string().optional(),
  groomFullName: z.string().optional(),
  groomParents: z.string().optional(),
  groomPhotoUrl: z.string().optional(),

  // Optional Quote Section
  quoteEnabled: z.boolean().default(false),
  quoteText: z.string().optional(),
  quoteSource: z.string().optional(),

  // Story Section
  storyEnabled: z.boolean(),
  storyTitle: z.string(),
  storyText: z.string().optional(),
  storyImage1Url: z.string().optional(),
  storyImage2Url: z.string().optional(),
  storyTimelineEnabled: z.boolean().default(false),
  storyTimeline: z.array(storyTimelineItemSchema).max(12).default([]),

  // Optional Dress Code Section
  dressCodeEnabled: z.boolean().default(false),
  dressCodeTitle: z.string().default('Dress Code'),
  dressCodeText: z.string().optional(),
  dressCodeColors: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'))
    .max(8)
    .default([]),

  // Gallery Section
  galleryEnabled: z.boolean(),
  galleryTitle: z.string(),
  galleryImages: z.array(z.string()),

  // Registry Section
  registryEnabled: z.boolean(),
  registryTitle: z.string(),
  registryText: z.string().optional(),
  bankAccounts: z.array(bankAccountSchema).max(6).default([]),
  giftAddress: z.string().optional(),

  // Music Section
  musicEnabled: z.boolean(),
  musicUrl: z.string().optional(),
  musicTitle: z.string().optional(),
  musicArtist: z.string().optional(),

  // Optional Live Streaming Section
  liveStreamEnabled: z.boolean().default(false),
  liveStreamUrl: z.string().optional(),

  // RSVP and Wishes
  rsvpEnabled: z.boolean().default(true),
  rsvpGuestCountEnabled: z.boolean().default(false),
  wishesEnabled: z.boolean().default(false),

  // Publishing
  slug: z.string().optional(),
  password: z.string().optional(),
  isPublished: z.boolean().optional(),

  // Events
  events: z.array(eventSchema),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type StoryTimelineItem = z.infer<typeof storyTimelineItemSchema>;
export type BankAccount = z.infer<typeof bankAccountSchema>;
export type WeddingSiteFormData = z.infer<typeof weddingSiteSchema>;

// Database Entity Types (matching Prisma schema)
export interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  address: string;
  order: number;
  siteId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeddingSite {
  id: string;
  userId: string;
  slug: string | null;
  password: string | null;
  isPublished: boolean;
  templateId: WeddingTemplateId;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  heroEnabled: boolean;
  brideName: string | null;
  groomName: string | null;
  weddingDate: Date | null;
  heroImageUrl: string | null;
  coupleDetailsEnabled: boolean;
  brideFullName: string | null;
  brideParents: string | null;
  bridePhotoUrl: string | null;
  groomFullName: string | null;
  groomParents: string | null;
  groomPhotoUrl: string | null;
  quoteEnabled: boolean;
  quoteText: string | null;
  quoteSource: string | null;
  storyEnabled: boolean;
  storyTitle: string | null;
  storyText: string | null;
  storyImage1Url: string | null;
  storyImage2Url: string | null;
  storyTimelineEnabled: boolean;
  storyTimeline: StoryTimelineItem[];
  dressCodeEnabled: boolean;
  dressCodeTitle: string | null;
  dressCodeText: string | null;
  dressCodeColors: string[];
  galleryEnabled: boolean;
  galleryTitle: string | null;
  galleryImages: string[];
  registryEnabled: boolean;
  registryTitle: string | null;
  registryText: string | null;
  bankAccounts: BankAccount[];
  giftAddress: string | null;
  musicEnabled: boolean;
  musicUrl: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  liveStreamEnabled: boolean;
  liveStreamUrl: string | null;
  rsvpEnabled: boolean;
  rsvpGuestCountEnabled: boolean;
  wishesEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  events?: Event[];
}

export interface RSVP {
  id: string;
  fullName: string;
  email: string | null;
  attending: boolean;
  guestCount: number | null;
  dietaryRestrictions: string | null;
  message: string | null;
  siteId: string;
  createdAt: Date;
}

export interface WeddingWish {
  id: string;
  fullName: string;
  message: string;
  isApproved: boolean;
  createdAt: Date;
  siteId: string;
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface WeddingSiteResponse {
  success: boolean;
  weddingSite: WeddingSite;
  message?: string;
}

export interface RSVPListResponse {
  success: boolean;
  rsvps: RSVP[];
  stats: {
    total: number;
    attending: number;
    notAttending: number;
    totalGuests: number;
  };
}
