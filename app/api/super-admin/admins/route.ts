import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['admin']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
    const validatedData = createAdminSchema.parse(body);

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [validatedData.email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Insert new admin user
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, status, email_verified, phone_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, name, email, role, status, created_at`,
      [
        validatedData.name,
        validatedData.email,
        validatedData.phone || null,
        hashedPassword,
        validatedData.role,
        'active',
        true,
        true
      ]
    );

    // Log the action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [
        decoded.userId,
        'admin_created',
        JSON.stringify({
          target_user_id: result.rows[0].id,
          target_user_name: result.rows[0].name,
          target_user_email: result.rows[0].email,
          created_by: decoded.email
        })
      ]
    );

    return NextResponse.json({
      message: 'Admin created successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Create admin error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}


export const runtime = 'nodejs';
