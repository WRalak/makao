import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Property from '@/models/Property';
import { verifyToken } from '@/lib/auth';

// POST - Schedule a tour
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { date, time } = await request.json();
    
    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    await connectDB();
    
    const property = await Property.findById(params.id).populate('agentId');
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // In production, this would save to a Tour model and send notifications
    const tour = {
      id: Date.now().toString(),
      propertyId: params.id,
      tenantId: decoded.userId,
      agentId: property.agentId._id,
      date,
      time,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // TODO: Send email notification to agent
    // TODO: Send confirmation email to tenant

    return NextResponse.json({ 
      message: 'Tour scheduled successfully',
      tour 
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to schedule tour:', error);
    return NextResponse.json(
      { error: 'Failed to schedule tour' },
      { status: 500 }
    );
  }
}
