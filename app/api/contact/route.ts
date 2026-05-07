import { NextRequest, NextResponse } from 'next/server';
import { handleDatabaseError } from '@/lib/database-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, email, phone, subject, message, category = 'general' } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
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

    // Determine priority based on subject
    let priority = 'medium';
    if (subject.toLowerCase().includes('urgent') || subject.toLowerCase().includes('emergency')) {
      priority = 'urgent';
    } else if (subject.toLowerCase().includes('support') || subject.toLowerCase().includes('issue')) {
      priority = 'high';
    } else if (subject.toLowerCase().includes('feedback') || subject.toLowerCase().includes('suggestion')) {
      priority = 'low';
    }

    // Insert into database
    const pool = await getDatabase();
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, category, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [name, email, phone, subject, message, category, priority]
    );

    const contactMessage = result.rows[0];

    // TODO: Send email notification to admin
    // await sendEmailNotification({
    //   to: 'admin@makao.com',
    //   subject: `New Contact Message: ${subject}`,
    //   template: 'contact-notification',
    //   data: { name, email, subject, message, category }
    // });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        id: contactMessage.id,
        created_at: contactMessage.created_at
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // This endpoint could be used by admin to retrieve contact messages
    // For now, return a simple response
    return NextResponse.json({
      message: 'Contact form endpoint is active'
    });
  } catch (error) {
    console.error('Contact form GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
