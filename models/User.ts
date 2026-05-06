import { query, queryOne } from '../lib/database-helpers';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  phone?: string;
  mpesaNumber?: string;
  avatarUrl?: string;
  bio?: string;
  companyName?: string;
  registrationNumber?: string;
  experienceYears?: number;
  licenseNumber?: string;
  idNumber?: string;
  stripeCustomerId?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  emailToken?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  timezone: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  ipAddress?: string;
  provider: string;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: Date;
    propertyLimit: number;
    propertyCount: number;
  };
}

class User {
  static async findById(id: string | number) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    return await queryOne<User>(sql, [id]);
  }

  static async findByEmail(email: string) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    return await queryOne<User>(sql, [email]);
  }

  static async create(data: Partial<User>) {
    const sql = `
      INSERT INTO users (name, email, password, role, status, phone, mpesa_number, avatar_url, bio, 
                         company_name, registration_number, experience_years, license_number, id_number,
                         stripe_customer_id, email_verified, phone_verified, website, linkedin, facebook, twitter,
                         email_notifications, sms_notifications, push_notifications, business_hours_start,
                         business_hours_end, timezone, provider, provider_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
              $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await query(sql, [
      data.name,
      data.email,
      data.password,
      data.role || 'tenant',
      data.status || 'active',
      data.phone,
      data.mpesaNumber,
      data.avatarUrl,
      data.bio,
      data.companyName,
      data.registrationNumber,
      data.experienceYears || 0,
      data.licenseNumber,
      data.idNumber,
      data.stripeCustomerId,
      data.emailVerified || false,
      data.phoneVerified || false,
      data.website,
      data.linkedin,
      data.facebook,
      data.twitter,
      data.emailNotifications !== undefined ? data.emailNotifications : true,
      data.smsNotifications !== undefined ? data.smsNotifications : true,
      data.pushNotifications !== undefined ? data.pushNotifications : true,
      data.businessHoursStart || '09:00:00',
      data.businessHoursEnd || '17:00:00',
      data.timezone || 'Africa/Nairobi',
      data.provider || 'email',
      data.providerId
    ]) as User[];
    return result[0];
  }

  static async update(id: string | number, data: Partial<User>) {
    const fields = Object.keys(data).filter(key => key !== 'id');
    const values = Object.values(data).filter((_, index) => fields[index] !== 'id');
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const sql = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id, ...values]) as User[];
    return result[0];
  }

  static async save(user: User) {
    if (user.id) {
      return await this.update(user.id, user);
    } else {
      return await this.create(user);
    }
  }
}

export default User;
