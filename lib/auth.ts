import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

// Local interface since we're using PostgreSQL instead of MongoDB
interface IUser {
  id: number;
  email: string;
  role: string;
  provider?: string;
  _id?: number;
  lockUntil?: Date;
  loginAttempts?: number;
  save?: (user: IUser) => Promise<void>;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10); // Updated to 10 rounds as specified
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: IUser, expiresIn: string = '7d'): string => {
  const payload = { 
    userId: user.id || user._id, 
    email: user.email, 
    role: user.role,
    provider: user.provider
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
};

export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { 
      userId: user.id || user._id,
      tokenVersion: Date.now() // For token invalidation
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );
};

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateRememberMeToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
};

export const createAuthCookie = (token: string, rememberMe: boolean = false): string => {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
  return `auth_token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
};

export const createRefreshCookie = (token: string): string => {
  return `refresh_token=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
};

export const clearAuthCookie = () => {
  return 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;';
};

export const clearRefreshCookie = () => {
  return 'refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;';
};

export const isAccountLocked = (user: IUser): boolean => {
  return !!(user.lockUntil && user.lockUntil > new Date());
};

export const incrementLoginAttempts = async (user: IUser): Promise<void> => {
  // These functions would need to be implemented with database queries
  // For now, we'll skip the login attempts tracking
  console.log('Login attempt tracking not implemented for PostgreSQL');
};

export const resetLoginAttempts = async (user: IUser): Promise<void> => {
  // These functions would need to be implemented with database queries
  // For now, we'll skip the login attempts tracking
  console.log('Login attempts reset not implemented for PostgreSQL');
};
