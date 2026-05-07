import { NextRequest, NextResponse } from 'next/server';
import { handleDatabaseError } from '@/lib/database-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { email, name, source = 'footer' } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Insert into database (handle duplicates gracefully)
    const pool = await getDatabase();
    
    try {
      const result = await pool.query(
        `INSERT INTO newsletter_subscriptions (email, name, source, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (email) 
         DO UPDATE SET 
           status = CASE 
             WHEN newsletter_subscriptions.status = 'unsubscribed' THEN 'active'
             ELSE newsletter_subscriptions.status
           END,
           updated_at = CURRENT_TIMESTAMP,
           unsubscribed_at = NULL
         RETURNING id, created_at, status`,
        [email, name || null, source]
      );

      const subscription = result.rows[0];

      // TODO: Send welcome email
      // if (subscription.status === 'active') {
      //   await sendEmailNotification({
      //     to: email,
      //     subject: 'Welcome to Makao Newsletter!',
      //     template: 'newsletter-welcome',
      //     data: { name: name || 'Subscriber' }
      //   });
      // }

      return NextResponse.json({
        success: true,
        message: subscription.status === 'active' 
          ? 'Successfully subscribed to our newsletter!' 
          : 'Welcome back! You have been re-subscribed to our newsletter.',
        data: {
          id: subscription.id,
          status: subscription.status,
          created_at: subscription.created_at
        }
      });

    } catch (dbError: any) {
      // Handle unique constraint violation (duplicate email)
      if (dbError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
          data: { status: 'already_subscribed' }
        });
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();
    const result = await pool.query(
      `UPDATE newsletter_subscriptions 
       SET status = 'unsubscribed', 
           unsubscribed_at = CURRENT_TIMESTAMP
       WHERE email = $1
       RETURNING id`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email not found in our subscription list' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.'
    });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // This endpoint could be used by admin to get newsletter stats
    const pool = await getDatabase();
    
    const [totalResult, activeResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM newsletter_subscriptions'),
      pool.query('SELECT COUNT(*) as active FROM newsletter_subscriptions WHERE status = \'active\'')
    ]);

    return NextResponse.json({
      stats: {
        total_subscribers: parseInt(totalResult.rows[0].total),
        active_subscribers: parseInt(activeResult.rows[0].active)
      }
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
