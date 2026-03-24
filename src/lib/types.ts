'use client';

import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export const CATEGORIES = ['Business Plan', 'Pitching', 'Hackathon', 'Incubation', 'Accelerator', 'Technology', 'Innovation', 'Design', 'Film', 'Photography', 'Art', 'Music'] as const;
export const PARTICIPANT_TYPES = ['นักเรียน/นักศึกษา', 'บุคคลทั่วไป', 'Early Stage Startup', 'Pre-Seed/Seed', 'SME', 'Corporate'] as const;
export const PRIZE_RANGES = [10000, 50000, 100000, 500000] as const;
export const BLOG_CATEGORIES = ['ออกแบบ', 'พัฒนา', 'งานเขียน', 'เคล็ดลับ'] as const;

export type CompetitionCategory = typeof CATEGORIES[number];
export type ParticipantType = typeof PARTICIPANT_TYPES[number];
export type PrizeRange = typeof PRIZE_RANGES[number];
export type BlogCategory = typeof BLOG_CATEGORIES[number];

export type FormFieldType = 'text' | 'number' | 'email' | 'url' | 'multiline' | 'file';
export type FormFieldConfig = {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
};

export const LAWYER_SPECIALTIES = ['Criminal', 'Civil', 'Corporate', 'Family', 'Intellectual Property', 'Labor', 'Real Estate', 'Immigration', 'Tax', 'Bankruptcy'] as const;
export const THAI_PROVINCES = ['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen', 'Chon Buri', 'Nakhon Ratchasima', 'Songkhla', 'Udon Thani', 'Surat Thani', 'Ubon Ratchathani'] as const; // Simplified list for demo

export type LawyerSpecialty = typeof LAWYER_SPECIALTIES[number];
export type LawyerProvince = typeof THAI_PROVINCES[number];

export type UserRole = 'user' | 'organizer' | 'admin';

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  profileName: string;
  role: UserRole;
  createdAt: Timestamp;
  plan?: 'free' | 'pro' | 'enterprise';
};

export type Lawyer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: LawyerSpecialty[];
  province: LawyerProvince;
  bio: string;
  education: string[];
  experienceYears: number;
  licenseNumber: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  consultationFee: number; // per hour in THB
  isVerified: boolean;
};

export type Competition = {
  id: string;
  title: string;
  description: string;
  prizes: string[];
  totalPrize: number;
  rules: string;
  deadline: string; // ISO string for easier serialization
  category: CompetitionCategory;
  participantType: ParticipantType[];
  rulesUrls: string[];
  socialUrls: string[];
  imageUrl?: string;
  views: number;
  featured?: boolean;
  isSaved?: boolean;
  featuredUntil?: string;
  featuredViews?: number;
  organizer?: string;
  location?: string;
  isApplicationEnabled?: boolean;
  formFields?: FormFieldConfig[];
  userId?: string;
  winnersAnnounced?: boolean;
};

export type SavedCompetition = {
  competitionId: string;
  savedAt: Timestamp;
}

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string | Timestamp; // ISO String or Firestore Timestamp
  authorName: string;
  authorImageUrl: string;
  authorId: string;
  category: BlogCategory;
  tags: string[];
  views: number;
  metaTitle?: string;
  metaDescription?: string;
};

export type Submission = {
  id: string;
  userId: string;
  competitionId: string;
  submissionDate: Timestamp | string; 
  submissionDetails: string;
  fileUrls?: string[];
  status?: 'pending' | 'accepted' | 'rejected' | 'winner';
  competitionTitle?: string;
  competitionImageUrl?: string;
  customFields?: Record<string, any>;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  organizerId?: string;
  paymentStatus?: 'unpaid' | 'pending' | 'paid';
  paymentAmount?: number;
  paymentSlipUrl?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  winnerRank?: number;
  winnerAwardName?: string;
  isTeamSubmission?: boolean;
  teamName?: string;
  teamMembers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type TicketCategory = 'bug' | 'support' | 'feedback' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'closed';

export type SupportTicket = {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export type HeroAd = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  active: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  expiresAt?: string;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  userId?: string;
  competitionId?: string;
  stripePaymentId?: string;
  createdAt: string;
};

export type CategoryIcon = {
  name: CompetitionCategory | BlogCategory | LawyerSpecialty;
  icon: LucideIcon;
};

export interface Voucher {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  expiryDate?: string;
  usageLimit?: number;
  usageCount: number;
  competitionId?: string;
  createdAt?: string;
}

export type LandingPageSectionType = 'hero' | 'about' | 'prizes' | 'rules' | 'schedule' | 'faqs' | 'contact' | 'custom';

export type LandingPageSection = {
  id: string;
  type: LandingPageSectionType;
  content: any; // Type-specific content: { title: string, subtitle?: string, ... }
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: 'small' | 'medium' | 'large';
    textAlign?: 'left' | 'center' | 'right';
  };
};

export type LandingPageTheme = {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
  showHeader: boolean;
  showFooter: boolean;
};

export type LandingPage = {
  id: string;
  competitionId: string;
  slug: string;
  title: string;
  sections: LandingPageSection[];
  theme: LandingPageTheme;
  createdAt: string;
  updatedAt: string;
};
