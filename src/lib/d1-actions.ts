'use server';

import { HeroAd, BlogPost, TicketStatus, TicketCategory, SupportTicket, Transaction, Submission, Voucher } from './types';
import { getDb, parseJson } from './db';
import { sendLineNotification } from './line-notify';
import { requireAdmin, verifySession, requireAdminOrOwner } from './server/auth-util';

/**
 * Get all active hero ads from D1.
 */
export async function getActiveHeroAdsFromD1(): Promise<HeroAd[]> {
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM hero_ads WHERE active = 1 AND (expiresAt IS NULL OR expiresAt > CURRENT_TIMESTAMP) ORDER BY sort_order ASC"
  ).all();

  return results.map((row: any) => ({
    id: row.id as string,
    title: row.title as string,
    imageUrl: row.imageUrl as string,
    linkUrl: row.linkUrl as string,
    order: row.sort_order as number,
    active: Boolean(row.active),
    createdAt: row.createdAt as string,
    expiresAt: row.expiresAt as string,
  }));
}

/**
 * Get all hero ads from D1 (including inactive ones for admin).
 */
export async function getAllHeroAdsFromD1(): Promise<HeroAd[]> {
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM hero_ads ORDER BY sort_order ASC"
  ).all();

  return results.map((row: any) => ({
    id: row.id as string,
    title: row.title as string,
    imageUrl: row.imageUrl as string,
    linkUrl: row.linkUrl as string,
    order: row.sort_order as number,
    active: Boolean(row.active),
    createdAt: row.createdAt as string,
    expiresAt: row.expiresAt as string,
  }));
}

/**
 * Get all blog posts from D1.
 */
export async function getBlogPostsFromD1(): Promise<BlogPost[]> {
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM blog_posts ORDER BY published_at DESC"
  ).all();

  return results.map((row: any) => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    imageUrl: row.imageUrl as string,
    date: row.published_at as string,
    authorName: row.authorName as string,
    authorImageUrl: row.authorImageUrl as string,
    authorId: row.authorId as string,
    category: row.category as any,
    tags: parseJson<string[]>(row.tags as string) || [],
    views: row.views as number,
  }));
}

/**
 * Add a new hero ad to D1.
 */
export async function addHeroAdToD1(ad: Omit<HeroAd, 'id' | 'createdAt'>) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO hero_ads (id, title, imageUrl, linkUrl, sort_order, active, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, ad.title, ad.imageUrl, ad.linkUrl, ad.order, ad.active ? 1 : 0, ad.expiresAt || null).run();
  return id;
}

/**
 * Update a hero ad in D1.
 */
export async function updateHeroAdInD1(id: string, ad: Partial<HeroAd>) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  const sets = [];
  const values = [];

  if (ad.title !== undefined) { sets.push("title = ?"); values.push(ad.title); }
  if (ad.imageUrl !== undefined) { sets.push("imageUrl = ?"); values.push(ad.imageUrl); }
  if (ad.linkUrl !== undefined) { sets.push("linkUrl = ?"); values.push(ad.linkUrl); }
  if (ad.order !== undefined) { sets.push("sort_order = ?"); values.push(ad.order); }
  if (ad.active !== undefined) { sets.push("active = ?"); values.push(ad.active ? 1 : 0); }
  if (ad.expiresAt !== undefined) { sets.push("expiresAt = ?"); values.push(ad.expiresAt); }

  if (sets.length === 0) return;

  values.push(id);
  await db.prepare(
    `UPDATE hero_ads SET ${sets.join(", ")}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(...values).run();
}

/**
 * Delete a hero ad from D1.
 */
export async function deleteHeroAdInD1(id: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  await db.prepare("DELETE FROM hero_ads WHERE id = ?").bind(id).run();
}

/**
 * Get a site setting by key.
 */
export async function getSettingFromD1(key: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const result: any = await db.prepare(
    "SELECT value FROM site_settings WHERE key = ?"
  ).bind(key).first();

  return result ? result.value : null;
}

/**
 * Update or create a site setting.
 */
export async function updateSettingInD1(key: string, value: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  await db.prepare(
    "INSERT INTO site_settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP) " +
    "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt"
  ).bind(key, value).run();
}

/**
 * Update a ticket status in D1.
 */
export async function updateTicketStatusInD1(ticketId: string, status: TicketStatus) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  await db.prepare(
    "UPDATE tickets SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(status, ticketId).run();
}

/**
 * Send a contact message (Email system).
 */
export async function sendContactMessage(data: { name: string, email: string, subject: string, message: string }) {
  const db = getDb();
  if (!db) return;

  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, data.name, data.email, data.subject, data.message).run();
  
  // Send LINE Notification
  const lineMessage = `\n📩 ใหม่! มีข้อความติดต่อ\n\nจาก: ${data.name}\nหัวข้อ: ${data.subject}\nอีเมล: ${data.email}\n\nข้อความ: ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}\n\nดูได้ที่: https://contestone-th.com/admin/messages`;
  await sendLineNotification(lineMessage);

  return id;
}

/**
 * Get all contact messages for admin.
 */
export async function getContactMessages() {
  await requireAdmin();
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM contact_messages ORDER BY createdAt DESC"
  ).all();

  return results.map((row: any) => ({
    ...row,
    updatedAt: row.updatedAt as string,
  }));
}

/**
 * Get all support tickets from D1.
 */
export async function getAllTicketsFromD1(): Promise<SupportTicket[]> {
  await requireAdmin();
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM tickets ORDER BY createdAt DESC"
  ).all();

  return results.map((row: any) => ({
    id: row.id as string,
    userId: row.userId as string,
    userEmail: row.userEmail as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as TicketCategory,
    status: row.status as TicketStatus,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  }));
}

/**
 * Get support tickets for a specific user from D1.
 */
export async function getUserTicketsFromD1(userId: string): Promise<SupportTicket[]> {
  await requireAdminOrOwner(userId);
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM tickets WHERE userId = ? ORDER BY createdAt DESC"
  ).bind(userId).all();

  return results.map((row: any) => ({
    id: row.id as string,
    userId: row.userId as string,
    userEmail: row.userEmail as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as TicketCategory,
    status: row.status as TicketStatus,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  }));
}

/**
 * Create a new support ticket in D1.
 */
export async function createTicketInD1(data: {
  userId: string;
  userEmail: string;
  title: string;
  description: string;
  category: TicketCategory;
}) {
  const db = getDb();
  if (!db) return;

  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO tickets (id, userId, userEmail, title, description, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, data.userId, data.userEmail, data.title, data.description, data.category, 'open').run();
  
  return id;
}

/**
 * Delete a support ticket from D1.
 */
export async function deleteTicketFromD1(ticketId: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  await db.prepare("DELETE FROM tickets WHERE id = ?").bind(ticketId).run();
}

/**
 * Get all transactions from D1.
 */
export async function getTransactionsFromD1(): Promise<Transaction[]> {
  await requireAdmin();
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM transactions ORDER BY date DESC"
  ).all();

  return results.map((row: any) => ({
    id: row.id as string,
    type: row.type as 'income' | 'expense',
    amount: row.amount as number,
    category: row.category as string,
    description: row.description as string,
    date: row.date as string,
    userId: row.userId as string,
    competitionId: row.competitionId as string,
    stripePaymentId: row.stripePaymentId as string,
    createdAt: row.createdAt as string,
  }));
}

/**
 * Internal: Add a new transaction to D1.
 */
export async function addTransactionInternal(db: any, data: Omit<Transaction, 'id' | 'createdAt'>) {
  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO transactions (id, type, amount, category, description, date, userId, competitionId, stripePaymentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    id, 
    data.type, 
    data.amount, 
    data.category, 
    data.description, 
    data.date || new Date().toISOString(), 
    data.userId || null, 
    data.competitionId || null,
    data.stripePaymentId || null
  ).run();
  
  return id;
}

/**
 * Public Server Action: Add a new transaction to D1.
 */
export async function addTransactionToD1(data: Omit<Transaction, 'id' | 'createdAt'>) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  return addTransactionInternal(db, data);
}

/**
 * Delete a transaction from D1.
 */
export async function deleteTransactionFromD1(id: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  await db.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
}

/**
 * Get finance summary (total income, expense, balance).
 */
export async function getFinanceSummaryFromD1() {
  await requireAdmin();
  const db = getDb();
  if (!db) return { income: 0, expense: 0, balance: 0 };

  const result: any = await db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
    FROM transactions
  `).first();

  const income = result?.totalIncome || 0;
  const expense = result?.totalExpense || 0;

  return {
    income,
    expense,
    balance: income - expense
  };
}

/**
 * Submit a competition entry to D1.
 */
export async function submitCompetitionToD1(data: Omit<Submission, 'id' | 'createdAt' | 'submissionDate'>) {
  // Ensure user is submitting as themselves (unless admin)
  await requireAdminOrOwner(data.userId);
  const db = getDb();
  if (!db) return;

  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO submissions (
      id, userId, competitionId, submissionDetails, fileUrls, status, 
      customFields, userName, userEmail, userPhone, organizerId,
      paymentStatus, paymentAmount, paymentSlipUrl,
      isTeamSubmission, teamName, teamMembers
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    data.userId,
    data.competitionId,
    data.submissionDetails || null,
    JSON.stringify(data.fileUrls || []),
    data.status || 'pending',
    JSON.stringify(data.customFields || {}),
    data.userName || null,
    data.userEmail || null,
    data.userPhone || null,
    data.organizerId || null,
    data.paymentStatus || 'unpaid',
    data.paymentAmount || 0,
    data.paymentSlipUrl || null,
    data.isTeamSubmission ? 1 : 0,
    data.teamName || null,
    JSON.stringify(data.teamMembers || [])
  ).run();

  return id;
}

/**
 * Get submissions from D1.
 */
export async function getSubmissionsFromD1(filters?: { competitionId?: string; userId?: string; status?: string }) {
  const db = getDb();
  if (!db) return [];

  let queryStr = "SELECT * FROM submissions WHERE 1=1";
  const params: any[] = [];

  if (filters?.competitionId) {
    queryStr += " AND competitionId = ?";
    params.push(filters.competitionId);
  }
  if (filters?.userId) {
    queryStr += " AND userId = ?";
    params.push(filters.userId);
  }
  if (filters?.status) {
    queryStr += " AND status = ?";
    params.push(filters.status);
  }

  queryStr += " ORDER BY createdAt DESC";

  const { results } = await db.prepare(queryStr).bind(...params).all();

  return results.map((row: any) => ({
    ...row,
    fileUrls: parseJson<string[]>(row.fileUrls) || [],
    customFields: parseJson<Record<string, any>>(row.customFields) || {},
  })) as Submission[];
}

/**
 * Get a single submission by ID.
 */
export async function getSubmissionByIdFromD1(id: string): Promise<Submission | null> {
  const db = getDb();
  if (!db) return null;

  const row: any = await db.prepare("SELECT * FROM submissions WHERE id = ?").bind(id).first();
  if (!row) return null;

  return {
    ...row,
    fileUrls: parseJson<string[]>(row.fileUrls) || [],
    customFields: parseJson<Record<string, any>>(row.customFields) || {},
    teamMembers: parseJson<string[]>(row.teamMembers) || [],
    isTeamSubmission: Boolean(row.isTeamSubmission),
  } as Submission;
}

/**
 * Verify payment for a submission.
 */
export async function verifyPaymentInD1(submissionId: string, status: 'paid' | 'unpaid') {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  const submission = await getSubmissionByIdFromD1(submissionId);
  if (!submission) throw new Error("Submission not found");

  // Update payment status
  await db.prepare("UPDATE submissions SET paymentStatus = ? WHERE id = ?")
    .bind(status, submissionId)
    .run();

  // If status is 'paid', create a transaction
  if (status === 'paid' && submission.paymentAmount && submission.paymentAmount > 0) {
    await addTransactionInternal(db, {
      type: 'income',
      amount: submission.paymentAmount,
      category: 'ticket_sale',
      description: `Payment for submission ${submissionId}`,
      date: new Date().toISOString(),
      userId: submission.userId,
      competitionId: submission.competitionId
    });
  }
}

/**
 * Winner selection input type.
 */
export type WinnerSelection = {
  submissionId: string;
  awardName: string;
  rank?: number;
};

/**
 * Sets winners for a competition and announces results.
 */
export async function setCompetitionWinners(competitionId: string, winners: WinnerSelection[]) {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  // 1. Clear previous winners for this competition
  await db.prepare("UPDATE submissions SET winnerRank = NULL, winnerAwardName = NULL WHERE competitionId = ?").bind(competitionId).run();

  // 2. Set new winners
  for (const win of winners) {
    await db.prepare("UPDATE submissions SET winnerRank = ?, winnerAwardName = ? WHERE id = ?")
      .bind(win.rank || null, win.awardName, win.submissionId)
      .run();
  }

  // 3. Mark competition as winners announced
  await db.prepare("UPDATE competitions SET winnersAnnounced = 1 WHERE id = ?").bind(competitionId).run();
}

/**
 * Gets winners for a competition.
 */
export async function getCompetitionWinners(competitionId: string) {
  const db = getDb();
  if (!db) return [];

  const { results } = await db.prepare(
    "SELECT * FROM submissions WHERE competitionId = ? AND winnerRank IS NOT NULL ORDER BY winnerRank ASC"
  ).bind(competitionId).all();

  return results.map((row: any) => ({
    ...row,
    fileUrls: (typeof row.fileUrls === 'string' ? JSON.parse(row.fileUrls) : row.fileUrls) || [],
    customFields: (typeof row.customFields === 'string' ? JSON.parse(row.customFields) : row.customFields) || {},
  })) as Submission[];
}

/**
 * Voucher Actions
 */

export async function getVoucherByCode(code: string, competitionId?: string): Promise<Voucher | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const result = await db.prepare('SELECT * FROM vouchers WHERE code = ?').bind(code.toUpperCase()).first<Voucher>();
    if (!result) return null;

    // Check expiry
    if (result.expiryDate && new Date(result.expiryDate) < new Date()) {
      return null;
    }

    // Check usage limit
    if (result.usageLimit && result.usageCount >= result.usageLimit) {
      return null;
    }

    // Check competition restriction
    if (result.competitionId && result.competitionId !== competitionId) {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error getting voucher:', error);
    return null;
  }
}

export async function getVouchers(): Promise<Voucher[]> {
  await requireAdmin();
  const db = getDb();
  if (!db) return [];

  try {
    const { results } = await db.prepare('SELECT * FROM vouchers ORDER BY createdAt DESC').all();
    return results as unknown as Voucher[];
  } catch (error) {
    console.error('Error getting vouchers:', error);
    return [];
  }
}

export async function createVoucher(voucher: Partial<Voucher>): Promise<boolean> {
  await requireAdmin();
  const db = getDb();
  if (!db) return false;

  const id = crypto.randomUUID();
  try {
    await db.prepare(`
      INSERT INTO vouchers (id, code, type, value, expiryDate, usageLimit, competitionId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      voucher.code?.toUpperCase(),
      voucher.type,
      voucher.value,
      voucher.expiryDate || null,
      voucher.usageLimit || null,
      voucher.competitionId || null
    ).run();
    return true;
  } catch (error) {
    console.error('Error creating voucher:', error);
    return false;
  }
}

export async function deleteVoucher(id: string): Promise<boolean> {
  await requireAdmin();
  const db = getDb();
  if (!db) return false;

  try {
    await db.prepare('DELETE FROM vouchers WHERE id = ?').bind(id).run();
    return true;
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return false;
  }
}

export async function incrementVoucherUsage(code: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.prepare('UPDATE vouchers SET usageCount = usageCount + 1 WHERE code = ?')
      .bind(code.toUpperCase())
      .run();
  } catch (error) {
    console.error('Error incrementing voucher usage:', error);
  }
}
