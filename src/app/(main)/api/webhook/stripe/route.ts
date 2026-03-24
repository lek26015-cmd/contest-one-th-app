import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { addTransactionInternal, incrementVoucherUsage } from '@/lib/d1-actions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database context not found' }, { status: 500 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata) {
      const { 
        submissionId, 
        competitionId, 
        userId, 
        userName, 
        userEmail, 
        customFields,
        isTeamSubmission,
        teamName,
        teamMembers,
        voucherCode
      } = metadata;

      // Increment voucher usage if applicable
      if (voucherCode) {
        await incrementVoucherUsage(voucherCode);
      }

      // Insert or Update submission record
      try {
        await db.prepare(`
          INSERT INTO submissions (
            id, userId, competitionId, userName, userEmail, customFields, 
            paymentStatus, paymentAmount, stripeSessionId, status,
            isTeamSubmission, teamName, teamMembers
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET 
            paymentStatus = excluded.paymentStatus,
            stripeSessionId = excluded.stripeSessionId
        `).bind(
          submissionId,
          userId,
          competitionId,
          userName,
          userEmail,
          customFields,
          'paid',
          (session.amount_total || 0) / 100,
          session.id,
          'confirmed',
          isTeamSubmission === '1' ? 1 : 0,
          teamName || null,
          teamMembers || '[]'
        ).run();

        // Create transaction record
        await addTransactionInternal(db, {
          type: 'income',
          amount: (session.amount_total || 0) / 100,
          category: 'ticket_sale',
          description: `Stripe payment for submission ${submissionId}`,
          date: new Date().toISOString(),
          userId: userId,
          competitionId: competitionId,
          stripePaymentId: session.id
        });

        console.log(`Successfully processed submission ${submissionId}`);
      } catch (err) {
        console.error('Error saving submission from Stripe webhook:', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
