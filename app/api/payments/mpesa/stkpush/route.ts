import { NextRequest, NextResponse } from 'next/server';
import { MpesaService } from '@/lib/mpesa';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const stkPushSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number is required'),
  amount: z.number().min(1, 'Amount must be positive'),
  accountReference: z.string().min(1, 'Account reference is required'),
  transactionDesc: z.string().min(1, 'Transaction description is required'),
});

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let user;
    try {
      user = verifyToken(token);
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = stkPushSchema.parse(body);

    const mpesaService = new MpesaService();

    const mpesaRequest = {
      phoneNumber: mpesaService.formatPhoneNumber(validatedData.phoneNumber),
      amount: validatedData.amount,
      accountReference: validatedData.accountReference,
      transactionDesc: validatedData.transactionDesc,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/mpesa/callback`
    };

    try {
      const mpesaResponse = await mpesaService.initiateStkPush(mpesaRequest);

      return NextResponse.json({
        success: true,
        message: 'M-PESA STK Push initiated successfully',
        checkoutRequestID: mpesaResponse.CheckoutRequestID,
        merchantRequestID: mpesaResponse.MerchantRequestID,
        customerMessage: mpesaResponse.CustomerMessage
      });

    } catch (mpesaError) {
      console.error('M-PESA STK Push error:', mpesaError);
      return NextResponse.json(
        { error: 'Failed to initiate M-PESA payment', details: mpesaError },
        { status: 500 }
      );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('STK Push error:', error);
    return NextResponse.json(
      { error: 'Failed to process STK Push request' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
