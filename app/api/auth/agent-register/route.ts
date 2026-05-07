import { NextRequest, NextResponse } from 'next/server';
import { queryOne, insert } from '@/lib/database-helpers';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const agentRegistrationSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required'),
  mpesaNumber: z.string().min(10, 'M-PESA number is required'),
  companyName: z.string().min(2, 'Company name is required'),
  registrationNumber: z.string().optional(),
  
  // Professional Details
  experience: z.enum(['0-1', '1-3', '3-5', '5+']),
  licenseNumber: z.string().min(5, 'License number is required'),
  idNumber: z.string().min(8, 'ID number is required'),
  
  // Password
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val === true, 'Must agree to terms'),
  
  // Verification
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  otpCode: z.string().optional(),
  otpExpires: z.string().optional(),
  
  // Documents (will be uploaded separately)
  documents: z.array(z.object({
    type: z.enum(['business_registration', 'tax_compliance', 'professional_license', 'bank_statement', 'sample_contract', 'id_passport', 'profile_photo']),
    url: z.string().url(),
    filename: z.string(),
    uploadedAt: z.string().default(new Date().toISOString())
  })).default([])
});

// STEP 1: Initial Agent Registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = agentRegistrationSchema.parse(body);

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1 OR phone = $2 OR mpesa_number = $3',
      [validatedData.email, validatedData.phone, validatedData.mpesaNumber]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email, phone, or M-PESA number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Generate OTP for phone verification
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');

    // Create agent user (pending verification)
    const result = await insert(
      `INSERT INTO users (
        name, email, password, role, phone, mpesa_number, company_name,
        registration_number, experience_years, license_number, id_number,
        email_verified, phone_verified, otp_code, otp_expires, email_token,
        is_active, is_banned, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        false, false, NOW(), NOW()
      )
      RETURNING id, email_token`,
      [
        validatedData.fullName,
        validatedData.email,
        hashedPassword,
        'agent',
        validatedData.phone,
        validatedData.mpesaNumber,
        validatedData.companyName,
        validatedData.registrationNumber || null,
        parseInt(validatedData.experience.split('-')[1]) || 0,
        validatedData.licenseNumber,
        validatedData.idNumber,
        false, // email_verified
        false, // phone_verified
        otpCode,
        otpExpires.toISOString(),
        emailToken
      ]
    );

    const user = result.rows[0];

    // TODO: Send OTP via SMS service
    // TODO: Send email verification link

    return NextResponse.json({
      message: 'Registration successful. Please verify your email and phone.',
      userId: user.id,
      emailToken: user.email_token,
      requiresEmailVerification: true,
      requiresPhoneVerification: true
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
