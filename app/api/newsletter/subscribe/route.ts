import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);

    const pool = await connectDB();

    // Check if email already exists
    const existingResult = await pool.query(
      'SELECT id FROM newsletter_subscribers WHERE email = $1',
      [validatedData.email]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Insert new subscriber
    await pool.query(
      'INSERT INTO newsletter_subscribers (email, subscribed_at, is_active) VALUES ($1, NOW(), true)',
      [validatedData.email]
    );

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      email: validatedData.email
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}
