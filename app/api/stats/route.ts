import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify authentication for sensitive stats
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

    // Only allow admin and super-admin to access stats
    if (!['admin', 'super_admin'].includes(user!.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.warn('Database connection failed, using fallback stats:', dbError);
      // Return fallback stats when database connection fails
      return NextResponse.json({
        totalProperties: 15000,
        totalTenants: 8000,
        totalAgents: 1200,
        totalCities: 25,
        satisfactionRate: 98,
        supportAvailable: true,
        usingFallback: true
      });
    }

    // Get total properties count
    const propertiesResult = await pool!.query('SELECT COUNT(*) as total FROM properties WHERE is_active = true');
    const totalProperties = parseInt(propertiesResult.rows[0].total);

    // Get total agents count
    const agentsResult = await pool!.query('SELECT COUNT(*) as total FROM users WHERE role = $1 AND is_active = true AND is_banned = false', ['agent']);
    const totalAgents = parseInt(agentsResult.rows[0].total);

    // Get total tenants count
    const tenantsResult = await pool!.query('SELECT COUNT(*) as total FROM users WHERE role = $1 AND is_active = true AND is_banned = false', ['tenant']);
    const totalTenants = parseInt(tenantsResult.rows[0].total);

    // Get total cities count (distinct cities from properties)
    const citiesResult = await pool!.query('SELECT COUNT(DISTINCT city) as total FROM properties WHERE is_active = true');
    const totalCities = parseInt(citiesResult.rows[0].total);

    // Calculate satisfaction rate (mock for now - could be calculated from reviews)
    const satisfactionRate = 98; // This would ideally come from a reviews table

    return NextResponse.json({
      totalProperties,
      totalTenants,
      totalAgents,
      totalCities,
      satisfactionRate,
      supportAvailable: true
    });

  } catch (error) {
    console.error('Failed to fetch platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform statistics' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
