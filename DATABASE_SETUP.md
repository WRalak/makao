# Database Setup Guide for Makao Platform

## Current Issue
The application is failing to connect to the PostgreSQL database with the error:
```
password authentication failed for user 'neondb_owner'
```

## Solution Options

### Option 1: Use Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL on your system:**
   - **Windows**: Download and install PostgreSQL from https://www.postgresql.org/download/windows/
   - **MacOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Create a database:**
   ```sql
   CREATE DATABASE makao;
   CREATE USER makao_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE makao TO makao_user;
   ```

3. **Create .env.local file:**
   ```bash
   DATABASE_URL=postgresql://makao_user:your_password@localhost:5432/makao
   ```

4. **Run the database schema:**
   ```bash
   npm run db:push
   ```

### Option 2: Use Neon Database (Cloud)

1. **Create a Neon account** at https://neon.tech
2. **Create a new project** and get the connection string
3. **Update .env.local:**
   ```bash
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Option 3: Use Docker (Recommended for Consistency)

1. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: makao
         POSTGRES_USER: makao_user
         POSTGRES_PASSWORD: makao_password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   volumes:
     postgres_data:
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

3. **Create .env.local:**
   ```bash
   DATABASE_URL=postgresql://makao_user:makao_password@localhost:5432/makao
   ```

## Environment Variables Required

Create a `.env.local` file in the root directory with:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/makao

# M-PESA (for production)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_ENVIRONMENT=sandbox

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Email (optional)
SENDGRID_API_KEY=your_sendgrid_api_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Database Schema

The application will automatically create the required tables when you run:
```bash
npm run db:push
```

Or manually run the schema from:
```bash
psql postgresql://username:password@localhost:5432/makao -f migrations/0001_complete_schema.sql
```

## Testing the Connection

After setting up the database, test the connection:
```bash
npm run dev
```

The application should start without database connection errors and use mock data as fallback when the database is not available.

## Troubleshooting

### Connection Issues:
1. Check if PostgreSQL is running: `pg_isready`
2. Verify the database exists: `\l` in psql
3. Check credentials: Try connecting with psql
4. Verify port: Default is 5432

### Common Errors:
- **"password authentication failed"**: Wrong password or user doesn't exist
- **"database does not exist"**: Create the database first
- **"connection refused"**: PostgreSQL not running or wrong port
- **"timeout"**: Network issues or firewall blocking

### Mock Data Mode
If you want to run the app without a database, the application will automatically fall back to mock data when the database connection fails. This is useful for frontend development and testing.
