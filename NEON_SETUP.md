# Neon Database Setup for Makao

This guide will help you set up Neon PostgreSQL database for the Makao real estate platform.

## 🚀 Quick Setup

### 1. Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Choose your region (recommended: East Africa or Europe for better performance)

### 2. Get Connection String
1. In your Neon dashboard, go to your project
2. Click on "Connection Details"
3. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

### 3. Update Environment Variables
Update your `.env.local` file with your Neon connection string:

```env
# Database (Neon PostgreSQL)
NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require

# Other environment variables...
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
# ... rest of your env vars
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Generate Database Schema
```bash
npm run db:generate
```

### 6. Push Schema to Neon
```bash
npm run db:push
```

### 7. Seed Database with Sample Data
```bash
npm run db:seed
```

### 8. Start Development Server
```bash
npm run dev
```

## 🗄️ Database Schema

The Makao platform uses the following tables:

### Core Tables
- **users**: User accounts (admin, agent, tenant)
- **spaces**: Agent subscription plans
- **properties**: Property listings
- **messages**: Real-time messaging
- **payments**: Payment transactions
- **admin_logs**: Admin activity tracking

### Additional Tables
- **favorites**: Saved properties
- **tours**: Property viewing appointments

## 🛠️ Database Commands

### Development Commands
```bash
# Generate migration files
npm run db:generate

# Push schema changes to database
npm run db:push

# View database in browser
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Production Commands
```bash
# Generate production migrations
npm run db:generate

# Apply migrations (production)
npm run db:migrate
```

## 🌍 East African Performance Tips

### 1. Choose the Right Region
- **Recommended**: Europe (Frankfurt) or East Africa region
- **Alternative**: US East Coast for backup

### 2. Connection Pooling
Neon automatically handles connection pooling, but you can optimize:
```env
# Add to your connection string
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require&max_connections=20
```

### 3. Indexing Strategy
The schema includes optimized indexes for:
- User lookups by email
- Property searches by location
- Message queries by participants
- Payment tracking by status

## 🔧 Configuration Options

### Environment Variables
```env
# Required
NEON_DATABASE_URL=postgresql://connection-string

# Optional (for connection pooling)
NEON_POOL_SIZE=20
NEON_TIMEOUT=30
```

### Drizzle Configuration
```typescript
// drizzle.config.ts
export default {
  schema: './lib/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
};
```

## 📊 Sample Data

The seed script creates:

### Users
- **1 Admin**: admin@makao.com / Admin123!
- **3 Agents**: john@makao.com, sarah@makao.com, mohamed@makao.com
- **5 Tenants**: alice@makao.com, james@makao.com, etc.

### Properties
- **5 Sample Properties**: Across Kenya, Uganda, Tanzania
- **Different Types**: Apartments, houses, villas
- **Realistic Pricing**: Local currency (KES, UGX, TZS)

### Subscriptions
- **Basic Plan**: KES 1,500/month (10 properties)
- **Pro Plan**: KES 3,500/month (50 properties)
- **Unlimited**: KES 10,000/month (unlimited properties)

## 🚨 Troubleshooting

### Common Issues

#### Connection Error
```
Error: getaddrinfo ENOTFOUND ep-xxx-xxx.us-east-1.aws.neon.tech
```
**Solution**: Check your connection string and internet connection

#### SSL Error
```
Error: self signed certificate
```
**Solution**: Ensure `sslmode=require` is in your connection string

#### Migration Error
```
Error: relation already exists
```
**Solution**: Drop existing tables or use `npm run db:push --force`

### Getting Help
1. Check [Neon Documentation](https://neon.tech/docs)
2. Review [Drizzle ORM Docs](https://orm.drizzle.team)
3. Check the console for detailed error messages

## 🔄 Migration from MongoDB

If you're migrating from MongoDB:

1. **Data Types**: PostgreSQL is more strict with data types
2. **Relationships**: Foreign keys are enforced
3. **Indexes**: Different indexing strategy
4. **Queries**: SQL syntax vs MongoDB queries

### Migration Steps
1. Export MongoDB data
2. Transform data for PostgreSQL schema
3. Import to Neon
4. Update application code to use Drizzle ORM

## 🎯 Best Practices

### Performance
- Use appropriate indexes for frequent queries
- Implement connection pooling
- Cache frequently accessed data
- Use read replicas for high traffic

### Security
- Use SSL connections (default in Neon)
- Implement row-level security if needed
- Regularly update connection strings
- Monitor for unusual activity

### Backup
- Neon provides automatic backups
- Test restore procedures regularly
- Export critical data periodically
- Document recovery procedures

## 📱 Mobile Optimization

Neon works great with mobile apps:
- Fast connection from East Africa
- Built-in connection pooling
- Automatic scaling
- Low latency queries

## 🎉 Ready to Go!

Once you complete these steps, your Makao platform will be running with:
- ✅ Fast PostgreSQL database
- ✅ East African optimized performance
- ✅ Real-time messaging support
- ✅ M-PESA payment integration
- ✅ Sample data for testing

Happy coding! 🚀
