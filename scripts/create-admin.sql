-- Create admin user for Makao platform
-- Email: wallaceralak@gmail.com
-- Password: 12345 (hashed with bcrypt)
-- Role: admin

INSERT INTO users (
  name,
  email,
  password,
  role,
  is_active,
  is_banned,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'Admin User',
  'wallaceralak@gmail.com',
  '$2b$10$wv8JBtC8ldtSzKu8vAcFqOaDjNWJBBcHaEvKqfLRdh809JEo8DEqi', -- bcrypt hash for '12345'
  'admin',
  true,
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
