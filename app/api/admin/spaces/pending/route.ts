import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Get pending space requests with enhanced details
    const pendingQuery = `
      SELECT 
        s.id,
        s.name,
        s.description,
        s.logo_url,
        s.monthly_fee,
        s.currency,
        s.property_limit,
        s.subscription_status,
        s.is_approved,
        s.areas_covered,
        s.property_types,
        s.years_in_business,
        s.active_properties,
        s.staff_count,
        s.documents,
        s.total_views,
        s.total_inquiries,
        s.total_leases,
        s.created_at,
        u.name as agent_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.mpesa_number,
        u.company_name,
        u.registration_number,
        u.license_number,
        u.id_number,
        u.experience_years,
        u.bio,
        u.website,
        u.linkedin,
        u.facebook,
        u.twitter,
        u.created_at as agent_registered_at
      FROM spaces s
      JOIN users u ON s.agent_id = u.id
      WHERE s.subscription_status = 'pending' AND s.is_approved = false
      ORDER BY s.created_at ASC
    `;

    const pendingResult = await pool!.query(pendingQuery);

    return NextResponse.json({
      pendingRequests: pendingResult.rows
    });

  } catch (error) {
    console.error('Get pending spaces error:', error);
    return NextResponse.json(
      { error: 'Failed to get pending spaces' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const { action, notes } = await request.json();

    if (!['approve', 'reject', 'request_more_info'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or request_more_info' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !notes) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Get space details
    const spaceResult = await pool!.query(
      'SELECT * FROM spaces WHERE id = $1',
      [id]
    );

    const space = spaceResult.rows[0];
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Update space based on action
    let updateQuery = '';
    let updateValues: any[] = [];
    let newStatus = '';

    switch (action) {
      case 'approve':
        updateQuery = `
          UPDATE spaces SET 
            subscription_status = $1, 
            is_approved = $2, 
            approved_at = $3,
            approved_by = $4,
            subscription_end_date = $5,
            updated_at = NOW()
          WHERE id = $6
        `;
        updateValues = ['active', true, new Date().toISOString(), decoded.userId, calculateNextPaymentDate(), id];
        newStatus = 'active';
        break;

      case 'reject':
        updateQuery = `
          UPDATE spaces SET 
            subscription_status = $1, 
            is_approved = $2,
            updated_at = NOW()
          WHERE id = $3
        `;
        updateValues = ['rejected', false, id];
        newStatus = 'rejected';
        break;

      case 'request_more_info':
        updateQuery = `
          UPDATE spaces SET 
            subscription_status = $1, 
            updated_at = NOW()
          WHERE id = $2
        `;
        updateValues = ['pending', id];
        newStatus = 'pending';
        break;
    }

    await pool!.query(updateQuery, updateValues);

    // Create admin log
    await pool!.query(
      'INSERT INTO admin_logs (admin_id, action, target_id, target_type, details, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [decoded.userId, `space_${action}`, id, 'space', JSON.stringify({
        spaceName: space.name,
        agentId: space.agent_id,
        notes: notes || null,
        previousStatus: space.subscription_status,
        newStatus: newStatus
      })]
    );

    // Send notification to agent
    const agentResult = await pool!.query(
      'SELECT email, phone, name FROM users WHERE id = $1',
      [space.agent_id]
    );
    const agent = agentResult.rows[0];

    if (agent) {
      let emailSubject = '';
      let emailMessage = '';
      
      switch (action) {
        case 'approve':
          emailSubject = 'Your Space Has Been Approved!';
          emailMessage = `Congratulations ${agent.name}! Your space "${space.name}" has been approved. You can now activate your subscription and start listing properties.`;
          break;
        case 'reject':
          emailSubject = 'Your Space Application Status';
          emailMessage = `Hi ${agent.name}, your space application "${space.name}" has been rejected. Reason: ${notes}`;
          break;
        case 'request_more_info':
          emailSubject = 'Additional Information Required for Your Space';
          emailMessage = `Hi ${agent.name}, we need additional information for your space "${space.name}". ${notes}`;
          break;
      }
      
      console.log(`Sending notification to agent: ${agent.email}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Message: ${emailMessage}`);
      
      // TODO: Implement actual email sending
    }

    return NextResponse.json({
      message: `Space ${action}d successfully`,
      spaceId: id,
      newStatus
    });

  } catch (error) {
    console.error('Space approval error:', error);
    return NextResponse.json(
      { error: 'Failed to update space' },
      { status: 500 }
    );
  }
}

function calculateNextPaymentDate(): string {
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate.toISOString();
}


export const runtime = 'nodejs';
