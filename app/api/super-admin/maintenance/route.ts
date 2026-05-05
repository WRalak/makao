import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const maintenanceSchema = z.object({
  enabled: z.boolean(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!userRole || userRole !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = maintenanceSchema.parse(body);

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Update maintenance mode setting
    await pool.query(
      `INSERT INTO system_settings (key, value, type, category, updated_at, updated_by)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW(), updated_by = $5`,
      [
        'maintenance_mode',
        validatedData.enabled.toString(),
        'boolean',
        'system',
        decoded.userId
      ]
    );

    // Log the action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [
        decoded.userId,
        'maintenance_mode_toggled',
        JSON.stringify({
          enabled: validatedData.enabled,
          message: validatedData.message,
          toggled_by: decoded.email
        })
      ]
    );

    return NextResponse.json({
      message: `Maintenance mode ${validatedData.enabled ? 'enabled' : 'disabled'} successfully`,
      maintenanceMode: validatedData.enabled,
      maintenanceMessage: validatedData.message
    });

  } catch (error) {
    console.error('Maintenance mode error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to toggle maintenance mode' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!userRole || userRole !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed', maintenanceMode: false }, { status: 500 });
    }

    // Get current maintenance mode status
    const result = await pool.query(
      'SELECT value FROM system_settings WHERE key = $1',
      ['maintenance_mode']
    );

    const maintenanceMode = result.rows.length > 0 ? result.rows[0].value === 'true' : false;

    return NextResponse.json({
      maintenanceMode,
      message: maintenanceMode ? 'Platform is in maintenance mode' : 'Platform is operational'
    });

  } catch (error) {
    console.error('Get maintenance mode error:', error);
    return NextResponse.json({ error: 'Failed to get maintenance mode status', maintenanceMode: false }, { status: 500 });
  }
}


export const runtime = 'nodejs';
