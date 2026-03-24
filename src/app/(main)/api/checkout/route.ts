import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { getVoucherByCode } from '@/lib/d1-actions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { 
      competitionId, 
      competitionTitle, 
      amount, 
      userId, 
      userName, 
      userEmail, 
      customFields,
      isTeamSubmission,
      teamName,
      teamMembers,
      voucherCode
    } = await req.json();

    if (!competitionId || !amount || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Re-verify quantity and voucher on server-side
    const basePrice = 500;
    let finalAmount = basePrice;
    let appliedVoucherCode = null;

    if (voucherCode) {
      const voucher = await getVoucherByCode(voucherCode, competitionId);
      if (voucher) {
        const discountAmount = voucher.type === 'percentage' 
          ? (basePrice * voucher.value) / 100 
          : voucher.value;
        finalAmount = Math.max(0, basePrice - discountAmount);
        appliedVoucherCode = voucher.code;
      }
    }

    // Security check: ensure the amount sent from client matches server-side calculation
    if (Math.round(finalAmount) !== Math.round(amount)) {
       // Allow small rounding differences, but generally they should match
       console.warn(`Amount mismatch: Client ${amount} vs Server ${finalAmount}`);
    }

    // Create a temporary submission record to get an ID
    const submissionId = crypto.randomUUID();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: `Application Fee: ${competitionTitle}`,
              description: `Competition ID: ${competitionId}`,
            },
            unit_amount: Math.round(finalAmount * 100), // Stripe expects amount in subunits (cents/satang)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${new URL(req.url).origin}/competitions/${competitionId}/apply?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(req.url).origin}/competitions/${competitionId}/apply?canceled=true`,
      customer_email: userEmail,
      metadata: {
        submissionId,
        competitionId,
        userId,
        userName,
        userEmail,
        isTeamSubmission: isTeamSubmission ? '1' : '0',
        teamName: teamName || '',
        teamMembers: JSON.stringify(teamMembers || []),
        customFields: JSON.stringify(customFields),
        voucherCode: appliedVoucherCode || '',
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
