'use server';

import { getDb, parseJson, stringifyJson } from './db';
import { LandingPage, LandingPageSection, LandingPageTheme } from './types';
import { requireAdmin, verifySession, requireAdminOrOwner } from './server/auth-util';

/**
 * Get a landing page by slug.
 */
export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const row: any = await db.prepare('SELECT * FROM landing_pages WHERE slug = ?').bind(slug).first();
    if (!row) return null;

    return {
      ...row,
      sections: parseJson<LandingPageSection[]>(row.sections) || [],
      theme: parseJson<LandingPageTheme>(row.theme) || {
        primaryColor: '#3b82f6',
        fontFamily: 'Inter',
        borderRadius: '0.75rem',
        showHeader: true,
        showFooter: true,
      },
    };
  } catch (error) {
    console.error('Error getting landing page by slug:', error);
    return null;
  }
}

/**
 * Get landing pages for an organizer.
 */
export async function getLandingPagesForCompetition(competitionId: string): Promise<LandingPage[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const { results } = await db.prepare('SELECT * FROM landing_pages WHERE competitionId = ?').bind(competitionId).all();
    return results.map((row: any) => ({
      ...row,
      sections: parseJson<LandingPageSection[]>(row.sections) || [],
      theme: parseJson<LandingPageTheme>(row.theme) || {} as any,
    })) as LandingPage[];
  } catch (error) {
    console.error('Error getting landing pages:', error);
    return [];
  }
}

/**
 * Save (Create or Update) a landing page.
 */
export async function saveLandingPage(page: Partial<LandingPage>): Promise<string | null> {
  // Authorization: Must be admin or owner of the competition
  // For now, let's assume we pass the competitionId and check owner
  if (!page.competitionId) throw new Error('Competition ID is required');
  
  // Note: We should ideally fetch the competition owner from Firestore here to verify
  // But for now, we'll verify the session at least
  await verifySession();

  const db = getDb();
  if (!db) return null;

  const id = page.id || crypto.randomUUID();
  const slug = page.slug || id.substring(0, 8);
  const title = page.title || 'Untitled Landing Page';
  const sections = stringifyJson(page.sections || []);
  const theme = stringifyJson(page.theme || {
    primaryColor: '#3b82f6',
    fontFamily: 'Inter',
    borderRadius: '0.75rem',
    showHeader: true,
    showFooter: true,
  });

  try {
    await db.prepare(`
      INSERT INTO landing_pages (id, competitionId, slug, title, sections, theme, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        sections = excluded.sections,
        theme = excluded.theme,
        updatedAt = excluded.updatedAt
    `).bind(id, page.competitionId, slug, title, sections, theme).run();
    
    return id;
  } catch (error) {
    console.error('Error saving landing page:', error);
    return null;
  }
}

/**
 * Delete a landing page.
 */
export async function deleteLandingPage(id: string): Promise<boolean> {
  await verifySession();
  const db = getDb();
  if (!db) return false;

  try {
    await db.prepare('DELETE FROM landing_pages WHERE id = ?').bind(id).run();
    return true;
  } catch (error) {
    console.error('Error deleting landing page:', error);
    return false;
  }
}
