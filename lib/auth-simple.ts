import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-key-2025-makao';

// Simple user interface for middleware
interface DecodedUser {
  userId: number;
  email: string;
  role: string;
  provider?: string;
}

export const verifyToken = (token: string): DecodedUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const generateToken = (user: DecodedUser, expiresIn: string = '7d'): string => {
  const payload = { 
    userId: user.userId, 
    email: user.email, 
    role: user.role,
    provider: user.provider
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
};
