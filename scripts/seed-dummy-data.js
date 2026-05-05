const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Sample agents data
const agents = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@makao.com',
    phone: '+254-712-345-678',
    password: 'password123', // Will be hashed
    role: 'agent',
    status: 'active',
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya',
    bio: 'Experienced real estate agent specializing in residential properties in Nairobi. With over 8 years in the industry, I help clients find their perfect homes.',
    company: 'Elite Properties Kenya',
    license: 'EA-12345',
    languages: ['English', 'Swahili'],
    average_rating: 4.8,
    review_count: 127,
    years_experience: 8,
    response_time: '< 2 hours',
    response_rate: 95,
    verified: true,
    featured: true,
    stripe_customer_id: 'cus_sample_1'
  },
  {
    name: 'Michael Okonkwo',
    email: 'michael.okonkwo@makao.com',
    phone: '+254-723-456-789',
    password: 'password123',
    role: 'agent',
    status: 'active',
    city: 'Dar es Salaam',
    state: 'Dar es Salaam Region',
    country: 'Tanzania',
    bio: 'Commercial and residential property expert in Dar es Salaam. I specialize in investment properties and help clients navigate the Tanzanian real estate market.',
    company: 'Coastal Real Estate',
    license: 'TZ-67890',
    languages: ['English', 'Swahili'],
    average_rating: 4.6,
    review_count: 89,
    years_experience: 6,
    response_time: '< 1 hour',
    response_rate: 98,
    verified: true,
    featured: false,
    stripe_customer_id: 'cus_sample_2'
  },
  {
    name: 'Grace Nakato',
    email: 'grace.nakato@makao.com',
    phone: '+256-701-234-567',
    password: 'password123',
    role: 'agent',
    status: 'active',
    city: 'Kampala',
    state: 'Central Region',
    country: 'Uganda',
    bio: 'Luxury property specialist in Kampala. I focus on high-end residential and commercial properties in prime locations.',
    company: 'Pearl Properties Uganda',
    license: 'UG-11111',
    languages: ['English', 'Luganda', 'Swahili'],
    average_rating: 4.9,
    review_count: 156,
    years_experience: 10,
    response_time: '< 3 hours',
    response_rate: 92,
    verified: true,
    featured: true,
    stripe_customer_id: 'cus_sample_3'
  },
  {
    name: 'James Mutiso',
    email: 'james.mutiso@makao.com',
    phone: '+254-734-567-890',
    password: 'password123',
    role: 'agent',
    status: 'active',
    city: 'Mombasa',
    state: 'Mombasa County',
    country: 'Kenya',
    bio: 'Coastal property expert specializing in beachfront and vacation properties. I help clients find their dream homes along the Kenyan coast.',
    company: 'Coastline Properties',
    license: 'EA-22222',
    languages: ['English', 'Swahili', 'German'],
    average_rating: 4.7,
    review_count: 102,
    years_experience: 7,
    response_time: '< 2 hours',
    response_rate: 94,
    verified: true,
    featured: false,
    stripe_customer_id: 'cus_sample_4'
  },
  {
    name: 'Annette Uwimana',
    email: 'annette.uwimana@makao.com',
    phone: '+250-788-123-456',
    password: 'password123',
    role: 'agent',
    status: 'active',
    city: 'Kigali',
    state: 'Kigali City',
    country: 'Rwanda',
    bio: 'Real estate professional in Kigali with expertise in both residential and commercial properties. I speak multiple languages to serve diverse clients.',
    company: 'Kigali Premier Properties',
    license: 'RW-33333',
    languages: ['English', 'French', 'Kinyarwanda'],
    average_rating: 4.5,
    review_count: 78,
    years_experience: 5,
    response_time: '< 4 hours',
    response_rate: 88,
    verified: false,
    featured: false,
    stripe_customer_id: 'cus_sample_5'
  }
];

// Sample properties data
const properties = [
  {
    title: 'Modern 3BR Apartment in Westlands',
    description: 'Beautiful modern apartment in the heart of Westlands with stunning city views. Features include spacious living areas, modern kitchen, and ample parking.',
    street: 'Riverside Drive, Westlands',
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya',
    zip_code: '00100',
    latitude: -1.2654,
    longitude: 36.7964,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    rent_amount: 85000,
    rent_currency: 'KES',
    security_deposit: 170000,
    available_date: '2024-02-01',
    lease_term: '12 months',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1570129477498-29c4c1d0d3b8?w=800',
      'https://images.unsplash.com/photo-1570129477498-29c4c1d0d3b8?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Gym', 'Pool', 'Security', 'Air Conditioning'],
    pet_policy: 'allowed',
    furnished: true,
    parking_spaces: 2,
    parking_type: 'covered',
    utilities_included: ['Water', 'Security'],
    utility_costs: 5000,
    agent_id: 1, // Sarah Johnson
    status: 'available',
    is_featured: true,
    is_active: true,
    is_verified: true,
    view_count: 234,
    message_count: 45,
    save_count: 67,
    application_count: 12,
    tour_count: 8
  },
  {
    title: 'Luxury Beach Villa in Diani',
    description: 'Stunning beachfront villa with private beach access. Perfect for those seeking luxury coastal living with breathtaking ocean views.',
    street: 'Diani Beach Road',
    city: 'Mombasa',
    state: 'Mombasa County',
    country: 'Kenya',
    zip_code: '80100',
    latitude: -4.2767,
    longitude: 39.5973,
    bedrooms: 5,
    bathrooms: 4,
    square_feet: 3500,
    rent_amount: 250000,
    rent_currency: 'KES',
    security_deposit: 500000,
    available_date: '2024-03-01',
    lease_term: '6 months',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-156607379125941a4b75a7a3a4271c3c?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Pool', 'Garden', 'Security', 'Air Conditioning', 'Beach Access'],
    pet_policy: 'restricted',
    furnished: true,
    parking_spaces: 3,
    parking_type: 'garage',
    utilities_included: ['Water', 'Security', 'Garden Maintenance'],
    utility_costs: 15000,
    agent_id: 4, // James Mutiso
    status: 'available',
    is_featured: true,
    is_active: true,
    is_verified: true,
    view_count: 567,
    message_count: 89,
    save_count: 134,
    application_count: 23,
    tour_count: 15
  },
  {
    title: 'Cozy Studio in Kololo',
    description: 'Compact and efficient studio apartment in the upscale Kololo neighborhood. Perfect for young professionals seeking convenience and style.',
    street: 'Kololo Hill Road',
    city: 'Kampala',
    state: 'Central Region',
    country: 'Uganda',
    zip_code: '256',
    latitude: 0.3214,
    longitude: 32.5852,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 450,
    rent_amount: 450000,
    rent_currency: 'UGX',
    security_deposit: 900000,
    available_date: '2024-01-15',
    lease_term: '6 months',
    images: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800',
      'https://images.unsplash.com/photo-1564012612740-3b5c7c8c1c4c?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Security', 'Air Conditioning'],
    pet_policy: 'not_allowed',
    furnished: false,
    parking_spaces: 1,
    parking_type: 'street',
    utilities_included: ['Security'],
    utility_costs: 50000,
    agent_id: 3, // Grace Nakato
    status: 'available',
    is_featured: false,
    is_active: true,
    is_verified: true,
    view_count: 123,
    message_count: 28,
    save_count: 45,
    application_count: 8,
    tour_count: 5
  },
  {
    title: 'Modern Office Space in Kigali',
    description: 'Prime commercial office space in Kigali business district. Features modern facilities and excellent connectivity.',
    street: 'KN 4 Ave',
    city: 'Kigali',
    state: 'Kigali City',
    country: 'Rwanda',
    zip_code: '0001',
    latitude: -1.9536,
    longitude: 30.0606,
    bedrooms: 0,
    bathrooms: 2,
    square_feet: 2000,
    rent_amount: 1200000,
    rent_currency: 'RWF',
    security_deposit: 2400000,
    available_date: '2024-02-15',
    lease_term: '12 months',
    images: [
      'https://images.unsplash.com/photo-1497366214041-f1e00b1c3c94?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Security', 'Air Conditioning', 'Meeting Rooms', 'Reception'],
    pet_policy: 'not_allowed',
    furnished: true,
    parking_spaces: 10,
    parking_type: 'covered',
    utilities_included: ['Security', 'Reception'],
    utility_costs: 200000,
    agent_id: 5, // Annette Uwimana
    status: 'available',
    is_featured: false,
    is_active: true,
    is_verified: false,
    view_count: 89,
    message_count: 34,
    save_count: 23,
    application_count: 3,
    tour_count: 7
  },
  {
    title: 'Family House in Masaki',
    description: 'Spacious family home in the prestigious Masaki area. Perfect for families seeking comfort and convenience in Dar es Salaam.',
    street: 'Masaki Road',
    city: 'Dar es Salaam',
    state: 'Dar es Salaam Region',
    country: 'Tanzania',
    zip_code: '14101',
    latitude: -6.7366,
    longitude: 39.2423,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2800,
    rent_amount: 350000,
    rent_currency: 'TZS',
    security_deposit: 700000,
    available_date: '2024-02-20',
    lease_term: '12 months',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Garden', 'Security', 'Air Conditioning', 'Playground'],
    pet_policy: 'allowed',
    furnished: false,
    parking_spaces: 2,
    parking_type: 'covered',
    utilities_included: ['Security', 'Garden Maintenance'],
    utility_costs: 80000,
    agent_id: 2, // Michael Okonkwo
    status: 'available',
    is_featured: true,
    is_active: true,
    is_verified: true,
    view_count: 345,
    message_count: 67,
    save_count: 98,
    application_count: 19,
    tour_count: 12
  },
  {
    title: 'Penthouse in Kilimani',
    description: 'Luxury penthouse with panoramic city views. Premium finishes and amenities for the discerning tenant.',
    street: 'Kilimani Road',
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya',
    zip_code: '00100',
    latitude: -1.2921,
    longitude: 36.8219,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 3200,
    rent_amount: 180000,
    rent_currency: 'KES',
    security_deposit: 360000,
    available_date: '2024-03-15',
    lease_term: '12 months',
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800',
      'https://images.unsplash.com/photo-1570129477498-29c4c1d0d3b8?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Pool', 'Gym', 'Security', 'Air Conditioning', 'Concierge'],
    pet_policy: 'restricted',
    furnished: true,
    parking_spaces: 2,
    parking_type: 'covered',
    utilities_included: ['Water', 'Security', 'Concierge'],
    utility_costs: 12000,
    agent_id: 1, // Sarah Johnson
    status: 'available',
    is_featured: true,
    is_active: true,
    is_verified: true,
    view_count: 456,
    message_count: 78,
    save_count: 112,
    application_count: 25,
    tour_count: 18
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash passwords (simple hash for demo purposes)
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;

    // Insert agents
    console.log('👥 Seeding agents...');
    for (const agent of agents) {
      const hashedPassword = await bcrypt.hash(agent.password, saltRounds);
      
      const agentQuery = `
        INSERT INTO users (
          name, email, phone, password, role, status, city, state, country,
          bio, company, license, languages, average_rating, review_count,
          years_experience, response_time, response_rate, verified, featured,
          stripe_customer_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20,
          $21, NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING RETURNING id
      `;

      await pool.query(agentQuery, [
        agent.name,
        agent.email,
        agent.phone,
        hashedPassword,
        agent.role,
        agent.status,
        agent.city,
        agent.state,
        agent.country,
        agent.bio,
        agent.company,
        agent.license,
        JSON.stringify(agent.languages),
        agent.average_rating,
        agent.review_count,
        agent.years_experience,
        agent.response_time,
        agent.response_rate,
        agent.verified,
        agent.featured,
        agent.stripe_customer_id
      ]);

      console.log(`✅ Added agent: ${agent.name}`);
    }

    // Insert properties
    console.log('🏠 Seeding properties...');
    for (const property of properties) {
      const propertyQuery = `
        INSERT INTO properties (
          title, description, street, city, state, country, zip_code,
          latitude, longitude, bedrooms, bathrooms, square_feet,
          rent_amount, rent_currency, security_deposit, available_date,
          lease_term, images, amenities, pet_policy, furnished,
          parking_spaces, parking_type, utilities_included, utility_costs,
          agent_id, status, is_featured, is_active, is_verified,
          view_count, message_count, save_count, application_count,
          tour_count, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27,
          $28, $29, $30, $31, $32,
          $33, $34, $35, $36, $37,
          $38, $39, $40, $41,
          NOW(), NOW()
        )
      `;

      await pool.query(propertyQuery, [
        property.title,
        property.description,
        property.street,
        property.city,
        property.state,
        property.country,
        property.zip_code,
        property.latitude,
        property.longitude,
        property.bedrooms,
        property.bathrooms,
        property.square_feet,
        property.rent_amount,
        property.rent_currency,
        property.security_deposit,
        property.available_date,
        property.lease_term,
        JSON.stringify(property.images),
        JSON.stringify(property.amenities),
        property.pet_policy,
        property.furnished,
        property.parking_spaces,
        property.parking_type,
        JSON.stringify(property.utilities_included),
        property.utility_costs,
        property.agent_id,
        property.status,
        property.is_featured,
        property.is_active,
        property.is_verified,
        property.view_count,
        property.message_count,
        property.save_count,
        property.application_count,
        property.tour_count
      ]);

      console.log(`✅ Added property: ${property.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary: ${agents.length} agents and ${properties.length} properties added`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeding function
seedDatabase();
