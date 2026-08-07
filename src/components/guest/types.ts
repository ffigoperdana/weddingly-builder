import type { WeddingTemplateId } from '../../lib/templates';
import type {
  BankAccount,
  StoryTimelineItem,
} from '../../lib/validations';

export interface GuestWeddingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
}

export interface GuestWeddingSite {
  id: string;
  slug: string;
  isPublished: boolean;
  templateId?: WeddingTemplateId;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  heroEnabled: boolean;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  heroImageUrl?: string;
  coupleDetailsEnabled?: boolean;
  brideFullName?: string;
  brideParents?: string;
  bridePhotoUrl?: string;
  groomFullName?: string;
  groomParents?: string;
  groomPhotoUrl?: string;
  quoteEnabled?: boolean;
  quoteText?: string;
  quoteSource?: string;
  storyEnabled: boolean;
  storyTitle: string;
  storyText?: string;
  storyImage1Url?: string;
  storyImage2Url?: string;
  storyTimelineEnabled?: boolean;
  storyTimeline?: StoryTimelineItem[];
  dressCodeEnabled?: boolean;
  dressCodeTitle?: string;
  dressCodeText?: string;
  dressCodeColors?: string[];
  galleryEnabled: boolean;
  galleryTitle: string;
  galleryImages: string[];
  registryEnabled: boolean;
  registryTitle: string;
  registryText?: string;
  bankAccounts?: BankAccount[];
  giftAddress?: string;
  musicEnabled: boolean;
  musicUrl?: string;
  musicTitle?: string;
  musicArtist?: string;
  liveStreamEnabled?: boolean;
  liveStreamUrl?: string;
  rsvpEnabled?: boolean;
  rsvpGuestCountEnabled?: boolean;
  wishesEnabled?: boolean;
  wishesDisplayEnabled?: boolean;
  events: GuestWeddingEvent[];
}

export interface GuestWeddingWish {
  id: string;
  fullName: string;
  message: string;
  createdAt: string;
}
