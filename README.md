# PropRent - Real Estate Rental Platform

A complete, production-ready full-stack real estate rental platform built with Next.js 14, TypeScript, MongoDB, and modern web technologies.

## 🏠 Features

### Business Model
- **Admin Platform**: Collects monthly subscription fees from agents
- **Agent Subscriptions**: $49/month (10 properties) or $99/month (50 properties)
- **Tenant Access**: Free browsing and messaging with agents
- **Commission**: 20% commission on all agent subscription payments

### User Roles

#### Admin Features
- Dashboard with revenue analytics and user statistics
- User management (ban/unban, delete accounts, change roles)
- Property approval system
- Platform settings and commission management
- Complete payment history and analytics
- Revenue trends and user growth charts

#### Agent Features
- Subscription management with Stripe integration
- Property listing with full address and map location
- Multiple image uploads via Cloudinary
- Real-time messaging with tenants
- Analytics dashboard (views, messages, performance)
- Property management (edit, delete, mark as rented)

#### Tenant Features
- Browse properties without login
- Advanced search and filtering
- Interactive map view with property markers
- Save favorite properties
- Real-time messaging with agents
- Rental application submission
- Property tour scheduling

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **React Hook Form** with Zod validation
- **Lucide React** icons
- **Recharts** for analytics

### Backend
- **Next.js API Routes** (serverless)
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with httpOnly cookies
- **bcryptjs** for password hashing

### Third-party Integrations
- **Stripe** for payment processing and subscriptions
- **Cloudinary** for image storage
- **Mapbox** for interactive maps
- **Socket.io** for real-time messaging
- **SendGrid** for email notifications

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd makao
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env-example.txt .env.local
```

4. Configure your `.env.local` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/proprent

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token

# Email
SENDGRID_API_KEY=SG.your-sendgrid-key
EMAIL_FROM=noreply@proprent.com

# App URLs
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

5. Start the development server:
```bash
npm run dev
```

## 🗄 Database Models

### User Model
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  role: 'admin' | 'agent' | 'tenant',
  avatar: string,
  phone: string,
  isActive: boolean,
  isBanned: boolean,
  emailVerified: boolean,
  stripeCustomerId: string,
  subscription: {
    plan: 'basic' | 'pro',
    status: 'active' | 'cancelled' | 'past_due',
    currentPeriodEnd: Date,
    propertyLimit: number,
    propertyCount: number,
  },
  createdAt: Date
}
```

### Property Model
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  agentId: ObjectId,
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    coordinates: { lat: number, lng: number }
  },
  rent: number,
  securityDeposit: number,
  bedrooms: number,
  bathrooms: number,
  squareFeet: number,
  images: string[],
  availabilityDate: Date,
  leaseTerm: string,
  amenities: {
    parking: boolean,
    laundry: boolean,
    petsAllowed: boolean,
    utilitiesIncluded: boolean,
    furnished: boolean,
    airConditioning: boolean,
    heating: boolean,
    internet: boolean,
  },
  status: 'available' | 'rented' | 'pending' | 'rejected',
  isApproved: boolean,
  views: number,
  messagesCount: number,
  createdAt: Date
}
```

## 🔐 Authentication

The platform uses JWT tokens stored in httpOnly cookies for secure authentication:

- **Registration**: Users can register as agents or tenants
- **Login**: Email/password authentication with role-based access
- **Middleware**: Route protection based on user roles
- **Token Verification**: Automatic token validation on protected routes

## 💳 Payment Integration

Stripe integration includes:

- **Subscription Plans**: Basic ($49/month) and Pro ($99/month)
- **Checkout Sessions**: Secure payment processing
- **Webhooks**: Real-time payment status updates
- **Commission Tracking**: Automatic commission calculation
- **Subscription Management**: Cancel/renew subscriptions

## 📍 Map Integration

Mapbox provides:

- **Property Locations**: Interactive map with property markers
- **Address Autocomplete**: Search suggestions for property addresses
- **Geocoding**: Convert addresses to coordinates
- **Map Views**: Property browsing on interactive maps

## 📸 Image Upload

Cloudinary integration:

- **Multiple Images**: Upload multiple property photos
- **Image Optimization**: Automatic resizing and compression
- **CDN Delivery**: Fast image loading globally
- **Image Gallery**: Lightbox viewer for property images

## 💬 Real-time Messaging

Socket.io enables:

- **Live Chat**: Real-time messaging between tenants and agents
- **Message Notifications**: Instant message alerts
- **Conversation History**: Persistent message storage
- **Read Status**: Message read/unread tracking

## 📧 Email System

SendGrid integration for:

- **Email Verification**: Account verification emails
- **Password Reset**: Secure password recovery
- **Notifications**: Important platform notifications
- **Marketing**: Promotional emails (optional)

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**: Configure all production environment variables
2. **Database**: Set up MongoDB cluster
3. **Stripe**: Configure production Stripe keys
4. **Webhooks**: Set up Stripe webhook endpoints
5. **Domain**: Configure custom domain and SSL

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Analytics

The platform includes comprehensive analytics:

- **Revenue Tracking**: Total revenue and trends
- **User Analytics**: User growth and engagement
- **Property Metrics**: Views, messages, conversions
- **Geographic Data**: Popular cities and regions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Role-Based Access**: Middleware for route protection
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Built-in Next.js protection
- **Secure Cookies**: httpOnly and secure flags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: support@proprent.com
- Documentation: [Link to docs]
- Issues: [Link to GitHub issues]

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered property recommendations
- [ ] Virtual tour integration
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Property comparison tools
- [ ] Integration with MLS systems

## 🚀 Quick Start

1. **Admin Login**: `admin@proprent.com` / `Admin123!`
2. **Agent Registration**: Create agent account, choose subscription plan
3. **Tenant Registration**: Free registration for browsing and messaging
4. **Property Listing**: Agents can add properties after subscription approval
5. **Property Search**: Tenants can browse and filter properties
6. **Real-time Communication**: Built-in messaging system

## 📁 Project Structure

```
makao/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── admin/          # Admin dashboard APIs
│   │   ├── agent/          # Agent management APIs
│   │   ├── properties/     # Property management APIs
│   │   └── stripe/         # Payment integration
│   ├── admin/              # Admin dashboard pages
│   ├── agent/              # Agent dashboard pages
│   ├── properties/         # Property browsing pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── lib/                    # Utility functions
│   ├── auth.ts            # Authentication helpers
│   ├── mongoose.ts        # Database connection
│   └── stripe.ts          # Stripe configuration
├── models/                 # Database models
│   ├── User.ts
│   ├── Property.ts
│   ├── Message.ts
│   ├── Payment.ts
│   └── Favorite.ts
├── middleware.ts           # Route protection
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # TailwindCSS configuration
├── package.json           # Dependencies
└── README.md              # This file
```
