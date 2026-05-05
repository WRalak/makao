import { NextRequest, NextResponse } from 'next/server';
import { MpesaService } from '@/lib/mpesa';
import connectDB from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    const mpesaService = new MpesaService();
    
    if (!mpesaService.validateCallback(callbackData)) {
      return NextResponse.json(
        { error: 'Invalid callback' },
        { status: 400 }
      );
    }

    const { Body } = callbackData;
    const { stkCallback } = Body;

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find the pending payment
    const paymentResult = await pool.query(
      'SELECT id, agent_id, space_id, amount FROM payments WHERE mpesa_receipt_number = $1 AND status = $2',
      [stkCallback.CheckoutRequestID, 'pending']
    );

    const payment = paymentResult.rows[0];
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    if (stkCallback.ResultCode === 0) {
      // Payment successful - activate space
      await pool.query(
        'UPDATE payments SET status = $1, payment_date = $2, mpesa_receipt_number = $3, updated_at = NOW() WHERE id = $4',
        ['completed', new Date(stkCallback.TransactionDate).toISOString(), stkCallback.MpesaReceiptNumber, payment.id]
      );

      // Activate the space
      await pool.query(
        'UPDATE spaces SET subscription_status = $1, subscription_end_date = $2, is_approved = $3, updated_at = NOW() WHERE id = $4',
        ['active', calculateNextPaymentDate(), true, payment.space_id]
      );

      // Create admin log
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, target_id, target_type, details, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [payment.agent_id, 'payment_completed', payment.id, 'payment', JSON.stringify({
          amount: payment.amount,
          mpesaReceiptNumber: stkCallback.MpesaReceiptNumber
        })]
      );

    } else {
      // Payment failed
      await pool.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        ['failed', payment.id]
      );

      // Update space status to past_due
      await pool.query(
        'UPDATE spaces SET subscription_status = $1, updated_at = NOW() WHERE id = $2',
        ['past_due', payment.space_id]
      );
    }

    return NextResponse.json({
      ResultCode: stkCallback.ResultCode,
      ResultDesc: stkCallback.ResultDesc
    });

  } catch (error) {
    console.error('M-PESA callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

function calculateNextPaymentDate(): string {
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate.toISOString();
}
