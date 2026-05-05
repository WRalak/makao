import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Only allow specific admin email
    if (email !== 'wallaceralak@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized email' }, { status: 403 });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Try to connect to database
    let pool;
    try {
      const connectDB = require('@/lib/mongoose').default;
      pool = await connectDB();
    } catch (dbError) {
      console.warn('Database connection failed, returning admin credentials:', dbError);
      return NextResponse.json({
        message: 'Database unavailable. Here are the admin credentials for manual setup:',
        email: 'wallaceralak@gmail.com',
        password: password,
        hashedPassword: hashedPassword,
        sql: `INSERT INTO users (name, email, password, role, is_active, is_banned, email_verified, created_at, updated_at) VALUES ('Admin User', 'wallaceralak@gmail.com', '${hashedPassword}', 'admin', true, false, true, NOW(), NOW()) ON CONFLICT (email) DO NOTHING;`
      });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ 
        message: 'Admin user already exists',
        email: email,
        role: existingUser.rows[0].role
      });
    }
    
    // Create the admin user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, is_active, is_banned, email_verified, created_at, updated_at) 
       VALUES ('Admin User', $1, $2, 'admin', true, false, true, NOW(), NOW()) 
       RETURNING id, email, role, created_at`,
      [email, hashedPassword]
    );
    
    const adminUser = result.rows[0];
    
    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        created_at: adminUser.created_at
      }
    });
    
  } catch (error) {
    console.error('Error in setup-admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin setup endpoint',
    instructions: 'Send POST request with email and password to create admin user',
    example: {
      email: 'wallaceralak@gmail.com',
      password: '12345'
    }
  });
}
