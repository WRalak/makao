import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.warn('Database connection failed, using fallback stats:', dbError);
      // Return fallback stats when database connection fails
      return NextResponse.json({
        totalProperties: 15000,
        totalCities: 25,
        satisfactionRate: 98,
        supportAvailable: true,
        usingFallback: true
      });
    }

    // Get total properties count (only available properties)
    const propertiesResult = await pool!.query('SELECT COUNT(*) as total FROM properties WHERE status = $1', ['available']);
    const totalProperties = parseInt(propertiesResult.rows[0].total);

    // Get total cities count (distinct cities from properties)
    const citiesResult = await pool!.query('SELECT COUNT(DISTINCT city) as total FROM properties WHERE status = $1', ['available']);
    const totalCities = parseInt(citiesResult.rows[0].total);

    // Get total tenants count
    const tenantsResult = await pool!.query('SELECT COUNT(*) as total FROM users WHERE role = $1 AND status = $2', ['tenant', 'active']);
    const totalTenants = parseInt(tenantsResult.rows[0].total);

    // Get total agents count
    const agentsResult = await pool!.query('SELECT COUNT(*) as total FROM users WHERE role = $1 AND status = $2', ['agent', 'active']);
    const totalAgents = parseInt(agentsResult.rows[0].total);

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
    console.error('Failed to fetch public stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform statistics' },
      { status: 500 }
    );
  }
}
