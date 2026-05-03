import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
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

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      if (existingUser.provider === validatedData.provider && existingUser.providerId === validatedData.providerId) {
        return NextResponse.json(
          { error: 'Account already exists with this provider' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate email verification token for email registrations
    const emailVerificationToken = validatedData.provider === 'email' 
      ? crypto.randomBytes(32).toString('hex') 
      : null;
    
    const emailVerificationExpires = validatedData.provider === 'email'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      : null;

    const hashedPassword = validatedData.provider === 'email' 
      ? await hashPassword(validatedData.password)
      : '';

    const user = new User({
      ...validatedData,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: validatedData.provider !== 'email', // Auto-verify social logins
      isActive: true,
    });

    await user.save();

    // Send email verification for email registrations
    if (validatedData.provider === 'email') {
      await sendVerificationEmail(user.email, emailVerificationToken!);
    }

    const token = generateToken(user);
    const cookie = createAuthCookie(token, validatedData.rememberMe);

    const response = NextResponse.json({
      message: validatedData.provider === 'email' 
        ? 'User registered successfully. Please check your email for verification.'
        : 'User registered successfully with social login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
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

async function sendVerificationEmail(email: string, token: string) {
  // In production, use SendGrid or similar email service
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  console.log('Email verification URL:', verificationUrl);
  
  // TODO: Implement actual email sending
  // await sendEmail({
  //   to: email,
  //   subject: 'Verify your PropRent account',
  //   html: `
  //     <h1>Welcome to PropRent!</h1>
  //     <p>Please click the link below to verify your email address:</p>
  //     <a href="${verificationUrl}">Verify Email</a>
  //     <p>This link will expire in 24 hours.</p>
  //   `
  // });
}
