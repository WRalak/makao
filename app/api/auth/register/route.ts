import { NextRequest, NextResponse } from 'next/server';
import { queryOne, insert } from '@/lib/database-helpers';
import { hashPassword, generateToken, createAuthCookie } from '@/lib/auth';
import { z } from 'zod';
import crypto from 'crypto';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['agent', 'tenant']),
  phone: z.string().optional(),
  provider: z.enum(['email', 'google', 'facebook', 'apple']).default('email'),
  providerId: z.string().optional(),
  rememberMe: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [validatedData.email]
    );
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Generate email verification token for email registrations
    const emailVerificationToken = validatedData.provider === 'email' 
      ? crypto.randomBytes(32).toString('hex') 
      : null;

    // Create user
    const result = await insert(
      `INSERT INTO users (name, email, password, role, phone, provider, provider_id, is_active, is_banned, email_verified, email_verification_token, email_verification_expires, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING id, name, email, role, is_active, email_verified`,
      [
        validatedData.name,
        validatedData.email,
        hashedPassword,
        validatedData.role,
        validatedData.phone,
        validatedData.provider,
        validatedData.providerId,
        true,
        false,
        validatedData.provider !== 'email', // Auto-verify social logins
        emailVerificationToken,
        validatedData.provider === 'email' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null, // 24 hours
        new Date(),
        new Date()
      ]
    );

    const user = result.rows[0];

    // Send email verification for email registrations
    if (validatedData.provider === 'email' && emailVerificationToken) {
      // TODO: Implement actual email sending
      console.log('Email verification URL:', `${process.env.NEXTAUTH_URL}/verify-email?token=${emailVerificationToken}`);
    }

    // Create user object compatible with generateToken
    const userForToken = {
      id: user.id,
      _id: user.id, // Map id to _id for compatibility
      email: user.email,
      role: user.role,
      provider: user.provider,
    };
    
    const token = generateToken(userForToken);
    const cookie = createAuthCookie(token, validatedData.rememberMe);

    const response = NextResponse.json({
      message: validatedData.provider === 'email' 
        ? 'User registered successfully. Please check your email for verification.'
        : 'User registered successfully with social login.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified,
        provider: user.provider,
      },
      requiresVerification: validatedData.provider === 'email',
    });

    response.headers.set('Set-Cookie', cookie);
    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
