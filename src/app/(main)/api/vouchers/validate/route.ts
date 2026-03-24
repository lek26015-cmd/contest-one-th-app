import { NextResponse } from 'next/server';
import { getVoucherByCode } from '@/lib/d1-actions';

export async function POST(req: Request) {
  try {
    const { code, competitionId } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const voucher = await getVoucherByCode(code, competitionId);

    if (!voucher) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid code, expired, or reached usage limit' 
      });
    }

    return NextResponse.json({ 
      valid: true, 
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value
      }
    });
  } catch (error: any) {
    console.error('Voucher Validation Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
