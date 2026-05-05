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
      'SELECT id, agent_id, amount, subscription_status FROM payments WHERE transaction_id = $1 AND status = $2',
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
      // Payment successful - activate subscription
      await pool.query(
        'UPDATE payments SET status = $1, payment_date = $2, mpesa_receipt_number = $3, updated_at = NOW() WHERE id = $4',
        ['completed', new Date(stkCallback.TransactionDate).toISOString(), stkCallback.MpesaReceiptNumber, payment.id]
      );

      // Activate or update agent's space
      const spaceResult = await pool.query(
        'SELECT id, property_limit, subscription_status FROM spaces WHERE agent_id = $1',
        [payment.agent_id]
      );

      if (spaceResult.rows.length > 0) {
        // Update existing space
        const space = spaceResult.rows[0];
        const propertyLimit = getPropertyLimit(payment.amount);
        
        await pool.query(
          'UPDATE spaces SET property_limit = $1, subscription_status = $2, subscription_end_date = $3, updated_at = NOW() WHERE id = $4',
          [propertyLimit, 'active', calculateNextPaymentDate(), space.id]
        );
      } else {
        // Create new space
        const propertyLimit = getPropertyLimit(payment.amount);
        
        await pool.query(
          `INSERT INTO spaces (
            agent_id, name, description, monthly_fee, property_limit, 
            subscription_status, subscription_end_date, is_approved, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, true, NOW(), NOW()
          )`,
          [
            payment.agent_id,
            'Agent Subscription',
            'Monthly subscription for Makao platform',
            payment.amount,
            propertyLimit,
            'active',
            calculateNextPaymentDate()
          ]
        );
      }
    } else {
      // Payment failed
      await pool.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        ['failed', payment.id]
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

function getPropertyLimit(amount: number): number {
  if (amount >= 10000) return 100; // Enterprise
  if (amount >= 5000) return 20;   // Premium
  return 5;                       // Basic
}

function calculateNextPaymentDate(): string {
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate.toISOString();
}
