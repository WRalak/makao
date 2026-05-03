# PropRent Complete Real Estate Rental Platform - All Features Documentation

PropRent is a comprehensive full-stack real estate rental platform built with Next.js 14, TypeScript, MongoDB, TailwindCSS, and Mapbox integration, featuring three user roles with distinct dashboards and capabilities.

## Landing Page (/)
Features an animated hero section with a large search bar, statistics counters showing platform metrics, a carousel of featured properties, a three-step "How It Works" guide (Search → Message → Tour), dedicated agent section with pricing cards (Basic $49/month for 10 properties, Pro $99/month for 50 properties), testimonials carousel, and a footer with newsletter signup.

## Property Search Page (/properties)
The core experience with a split-view layout:

**Left Panel - Advanced Filters:**
- Price range slider ($500-$10,000)
- Bedrooms dropdown (1-4+)
- Bathrooms dropdown
- Property type checkboxes (Apartment, House, Condo, Townhouse)
- Amenities (Parking, Laundry, Pet Friendly, Pool, Gym, AC, Heating)
- Availability date picker
- Pet policy radio buttons
- Sort options (Price Low to High, Price High to Low, Newest First, Most Viewed)

**Right Panel - Interactive Mapbox GL JS:**
- Property markers color-coded by price range
- Cluster markers for performance
- Popups showing image, rent amount, beds/baths and "View Details" button
- Geolocation button to find properties near the user
- Map bounds detection that automatically fetches new properties when panning/zooming

**Property Listing Cards:**
- Scrollable property cards showing images, price, address, beds/baths/square feet
- Save, message, and view buttons
- Pagination controls

## Property Detail Page (/properties/[id])
**Left Column:**
- Lightbox image gallery with thumbnail navigation
- Full property specifications (price, address, bedrooms, bathrooms, square feet, parking, laundry, pet policy, availability date, lease term, security deposit)
- Detailed description with rich text
- Amenities list with icons
- Location map showing exact property marker with nearby points of interest (grocery stores, parks, transit stops)
- Walk score and transit score badges
- "Get Directions" button linking to Google Maps
- Carousel of similar properties

**Right Column:**
- Agent profile card with avatar, name, phone, star rating, response time
- Action buttons: "Message Agent", "Schedule Tour", "Save Property", "Share", "Report"
- Questions and answers section for tenant inquiries

## Authentication Pages

### Login Page (/login)
- Email and password fields with show/hide password toggle
- Remember me checkbox
- Forgot password link
- Social login options (Google, Facebook, Apple)
- Sign-up redirection

### Registration Page (/register)
- Role selection toggle between Tenant and Agent
- Full name, email, phone number (optional)
- Password with strength meter (Weak/Medium/Strong)
- Confirm password
- Terms agreement checkbox
- Account creation button

## Agent Dashboard (/agent/dashboard)
**Metrics Cards:**
- Total property views
- Message count
- Active properties count (with limit usage percentage)
- Qualified leads

**Analytics:**
- Property performance bar chart comparing views per property
- Lead conversion funnel (views → messages → tours → signed leases)

**Recent Messages Panel:**
- Tenant names, message previews, timestamps, reply buttons

**Quick Actions:**
- Add properties, view all properties, messages, upgrade plan, analytics report, settings

**Subscription Status Card:**
- Current plan (Basic or Pro)
- Status (active/pending/past due)
- Next payment date
- Property usage meter
- Action buttons: upgrade, cancel, payment history

## Agent Management Pages

### Manage Spaces (/agent/spaces)
Lists all agent spaces with cards showing:
- Space name, subscription plan, status badge (Active, Pending Approval, Past Due)
- Property usage count, creation date, next payment date
- Action buttons: view properties, edit space, upgrade plan, cancel subscription
- "Create New Space" modal with space name, description, plan selection, Stripe checkout redirect

### Manage Properties (/agent/properties)
- Searchable and filterable data table
- Columns: property title, rent amount, status badge, view count, message count, action icons
- Pagination controls, bulk actions dropdown, export CSV functionality

### Add/Edit Property Form (/agent/properties/add)
**5-Step Wizard:**
- Step 1: Basic information (title, description with rich text editor)
- Step 2: Mapbox address autocomplete with geocoding, draggable pin on interactive map, latitude/longitude display
- Step 3: Property details (bedrooms, bathrooms, square feet, rent, security deposit, availability date, lease term)
- Step 4: Amenities (utilities included, property amenities, pet policy, parking spots counter)
- Step 5: Media upload with drag-and-drop Cloudinary multiple image uploader (JPG, PNG, WebP up to 10MB), image preview grid with reordering, virtual tour URL field
- Save as draft, preview, and publish buttons

### Agent Messages (/agent/messages)
**Split Conversation Interface:**
- Left sidebar: conversation list with tenant avatar, name, last message preview, timestamp, unread indicator
- Right panel: active chat with property context banner, message history as bubbles, typing indicators, read receipts, file attachment support, emoji picker, quick reply templates

### Agent Payments (/agent/payments)
- Payment history table with date, amount, plan, status, invoice number, download PDF receipt
- Upcoming payments calendar
- Subscription management (update credit card, cancel plan)

## Tenant Pages

### Tenant Dashboard (/tenant/dashboard)
- Saved properties grid with property cards (image, price, address, beds/baths, remove button)
- Recent activity feed (viewed properties, sent messages, saved searches, application status)
- Recommended properties based on search history
- Quick links to browse properties and messages

### Saved Properties (/tenant/saved)
- Grid of favorited properties with remove button and "Message Agent" quick action

### Tenant Messages (/tenant/messages)
- Mirrors agent messaging interface from tenant perspective
- Conversation list with agent names and property references
- Chat window with message history, image/document sending, email notifications for offline users

### Applications (/tenant/applications)
- Rental application status with progress bars (submitted → under review → approved/denied → lease signing)
- Document upload buttons for pay stubs, ID, employment verification, bank statements
- Electronic signature integration via DocuSign

## Admin Panel (/admin/dashboard)
**Analytics Dashboard:**
- Revenue charts (monthly recurring revenue, total platform commission collected)
- User growth line graph
- Property listing trends
- Recent activity feed

### Admin Users (/admin/users)
- Data table with all platform users (name, email, role, status, join date)
- Action buttons: ban/unban, role change, delete user
- Search and filter by role and status
- Bulk user actions

### Admin Spaces (/admin/spaces)
- Space approval queue with pending spaces (agent name, details, plan, submission date)
- Approve/reject buttons with reason field
- Table of approved spaces with suspend/delete options

### Admin Payments (/admin/payments)
- Revenue reports with platform income charts
- Transaction history (agent subscription payments, commission earned, payout status)
- Export reports for accounting

### Admin Settings (/admin/settings)
- Platform configuration (commission rate default 20%, subscription plan prices)
- Feature toggles
- Email notification templates
- System maintenance mode

## Technical Features

### Real-time Messaging (Socket.io)
- Rooms per conversation
- Typing indicators
- Read receipts
- Email notifications for offline users

### Stripe Integration
- Checkout for agent subscription payments
- Webhook handling for payment success/failure
- Automatic space suspension after 3-day grace period
- Email reminders 5 days before renewal

### Cloudinary Image Upload
- Multiple file support with drag-and-drop interface
- Automatic optimization (WebP conversion, responsive breakpoints)
- Image preview before upload

### Mapbox GL JS Integration
- Address autocomplete from forward geocoding
- Reverse geocoding for coordinate display
- Interactive markers with custom SVG styling
- Popup windows and cluster markers for performance
- Map bounds detection to fetch properties within viewport
- Geolocation to find properties near user
- "Get Directions" linking to Google Maps

### Database (MongoDB)
- Indexes on property queries (rentAmount, bedrooms, city, coordinates)
- Text search on title/description

### Security Features
- JWT authentication with httpOnly cookies
- bcrypt password hashing with 10 rounds
- Role-based middleware protecting routes
- Rate limiting on API routes (100 requests per minute)
- Input validation using Zod

### Email Notifications (SendGrid/Nodemailer)
- Welcome emails
- New message alerts (both parties)
- Payment confirmations
- Subscription renewal reminders
- Space approval/rejection notifications
- Password reset

### Analytics
- Property views, message counts, conversion funnels
- Lead tracking with charts powered by Recharts library

## Database Schema

### User Model
- name, email, hashed password, role, avatar, phone
- isActive, isBanned, emailVerified
- stripeCustomerId, createdAt

### Space Model
- name, description, agentId ref, monthlyFee, propertyLimit
- currentPropertyCount, subscriptionStatus, subscriptionEndDate
- stripeSubscriptionId, isApproved

### Property Model
- Geospatial indexing on coordinates
- title, description, spaceId, agentId
- Address object (street/city/state/zipCode/country/coordinates)
- bedrooms, bathrooms, squareFeet, rentAmount, securityDeposit
- availableDate, leaseTerm, utilitiesIncluded, petPolicy
- parkingSpots, laundryType, amenities array, images array
- virtualTourUrl, status, views counter, messages counter

### Message Model
- senderId, receiverId, propertyId, content, attachments array
- isRead, readAt, createdAt

### Payment Model
- agentId, spaceId, amount, currency, stripePaymentIntentId
- stripeSubscriptionId, status, paymentDate, expiryDate

### AdminLog Model
- Audit trail for admin actions

## Deployment & Setup

### Environment Variables
- MongoDB URI, JWT secret
- Stripe public/secret keys with webhook secret
- Cloudinary cloud name/api key/api secret
- Mapbox public token, SendGrid API key, app URL

### Setup Instructions
1. Clone repository, install dependencies with `npm install`
2. Configure `.env.local` file
3. Start MongoDB locally or connect to MongoDB Atlas
4. Run `stripe listen --forward-to localhost:3000/api/payments/webhook` for webhook testing
5. Seed database with `npm run seed` to create admin user (admin@proprest.com / Admin123!), sample agents, properties across different cities, and tenant users
6. Run `npm run dev` to start development server on port 3000

## Platform Capabilities

PropRent is a complete turnkey solution for real estate rental marketplaces where:
- Agents pay monthly subscriptions to list properties
- Tenants browse and message for free
- Admin manages everything from a centralized dashboard

The application supports all CRUD operations, real-time features, payment processing, map location services, image uploads, email notifications, role-based access control, responsive mobile-first design with TailwindCSS breakpoints, dark mode support, and is production-ready for deployment to Vercel (frontend) and MongoDB Atlas (database) with proper security headers, rate limiting, input sanitization, and error handling.
