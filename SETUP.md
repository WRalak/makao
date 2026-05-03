# PropRent Setup Guide

## Quick Start

1. **Environment Setup**
   ```bash
   # Copy the environment template
   cp env-template.txt .env.local
   
   # Update the environment variables in .env.local:
   # - Set your MongoDB connection string
   # - Generate secure JWT secrets
   # - Add your API keys for services you'll use
   ```

2. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env.local` with your connection string

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Features Already Implemented ✅

### Authentication System
- User registration (Tenant/Agent roles)
- Login/logout with JWT tokens
- Role-based access control middleware
- Email verification structure
- Password reset structure

### Property Management
- Property creation form for agents
- Property listing with search/filters
- Property details page
- Image upload structure
- Map integration ready

### User Dashboards
- Agent dashboard for property management
- Tenant dashboard structure
- Admin dashboard structure

### API Endpoints
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/auth/me` - Get current user
- `/api/properties` - Property CRUD operations
- `/api/properties/[id]` - Individual property operations

## Next Steps to Complete

### High Priority
1. **Set up MongoDB connection** - Required for all features
2. **Test registration/login flow** - Verify authentication works
3. **Create sample properties** - Test property management
4. **Implement image uploads** - For property photos

### Medium Priority
1. **Stripe integration** - For agent subscriptions
2. **Real-time messaging** - Socket.io implementation
3. **Admin dashboard** - User management
4. **Email notifications** - Verification and alerts

### Low Priority
1. **Map integration** - Google Maps/Mapbox
2. **Advanced search** - Geospatial queries
3. **Analytics dashboard** - Performance metrics
4. **Mobile app** - React Native or PWA

## Environment Variables Required

```env
# Required for basic functionality
MONGODB_URI=mongodb://localhost:27017/proprent
JWT_SECRET=your-super-secret-jwt-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key

# Optional (for advanced features)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
EMAIL_HOST=smtp.gmail.com
MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

## Testing the App

1. **Register as a Tenant**
   - Go to `/register`
   - Select "Tenant" role
   - Fill out the form
   - Try logging in

2. **Register as an Agent**
   - Go to `/register`
   - Select "Agent" role
   - Fill out the form
   - Access agent dashboard

3. **Create Properties**
   - As an agent, go to `/agent/properties/create`
   - Fill out property details
   - Test property management

## Architecture Notes

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with MongoDB
- **Authentication**: JWT with HttpOnly cookies
- **File Structure**: App Router with proper separation
- **Styling**: Tailwind CSS v4 with custom components

## Development Tips

- Use `npm run build` to check for errors
- Check the console for database connection issues
- Test all user roles (tenant, agent, admin)
- Verify middleware redirects work correctly
