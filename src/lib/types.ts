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
  isSaved?: boolean; // Add this field
  featuredUntil?: string; // ISO Date string
  featuredViews?: number;
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
  submissionDate: Timestamp | string; // Can be Timestamp from server or string
  submissionDetails: string;
  competitionTitle?: string; // For display in history
  competitionImageUrl?: string; // For display in history
}

export type CategoryIcon = {
  name: CompetitionCategory | BlogCategory;
  icon: LucideIcon;
};
