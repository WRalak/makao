const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require',
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
    password: 'password123',
    role: 'agent',
    status: 'active',
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya',
    bio: 'Experienced real estate agent specializing in residential properties in Nairobi. With over 8 years in the industry, I help clients find their perfect homes.',
    companyName: 'Elite Properties Kenya',
    experienceYears: 8,
    licenseNumber: 'EA-12345',
    stripeCustomerId: 'cus_sample_1',
    emailVerified: true,
    phoneVerified: true
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
    companyName: 'Coastal Real Estate',
    experienceYears: 6,
    licenseNumber: 'TZ-67890',
    stripeCustomerId: 'cus_sample_2',
    emailVerified: true,
    phoneVerified: true
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
    companyName: 'Pearl Properties Uganda',
    experienceYears: 10,
    licenseNumber: 'UG-11111',
    stripeCustomerId: 'cus_sample_3',
    emailVerified: true,
    phoneVerified: true
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
    zipCode: '00100',
    latitude: -1.2654,
    longitude: 36.7964,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    rentAmount: 85000,
    rentCurrency: 'KES',
    securityDeposit: 170000,
    availableDate: '2024-02-01',
    leaseTerm: '12 months',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1570129477498-29c4c1d0d3b8?w=800',
      'https://images.unsplash.com/photo-1570129477498-29c4c1d0d3b8?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Gym', 'Pool', 'Security', 'Air Conditioning'],
    petPolicy: 'allowed',
    furnished: true,
    parkingSpaces: 2,
    parkingType: 'covered',
    utilitiesIncluded: ['Water', 'Security'],
    utilityCosts: 5000,
    agentId: 1,
    status: 'available',
    isFeatured: true,
    isActive: true,
    isVerified: true,
    viewCount: 234,
    messageCount: 45,
    saveCount: 67,
    applicationCount: 12,
    tourCount: 8
  },
  {
    title: 'Luxury Beach Villa in Diani',
    description: 'Stunning beachfront villa with private beach access. Perfect for those seeking luxury coastal living with breathtaking ocean views.',
    street: 'Diani Beach Road',
    city: 'Mombasa',
    state: 'Mombasa County',
    country: 'Kenya',
    zipCode: '80100',
    latitude: -4.2767,
    longitude: 39.5973,
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 3500,
    rentAmount: 250000,
    rentCurrency: 'KES',
    securityDeposit: 500000,
    availableDate: '2024-03-01',
    leaseTerm: '6 months',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-156607379125941a4b75a7a3a4271c3c?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Pool', 'Garden', 'Security', 'Air Conditioning', 'Beach Access'],
    petPolicy: 'restricted',
    furnished: true,
    parkingSpaces: 3,
    parkingType: 'garage',
    utilitiesIncluded: ['Water', 'Security', 'Garden Maintenance'],
    utilityCosts: 15000,
    agentId: 2,
    status: 'available',
    isFeatured: true,
    isActive: true,
    isVerified: true,
    viewCount: 567,
    messageCount: 89,
    saveCount: 134,
    applicationCount: 23,
    tourCount: 15
  },
  {
    title: 'Cozy Studio in Kololo',
    description: 'Compact and efficient studio apartment in the upscale Kololo neighborhood. Perfect for young professionals seeking convenience and style.',
    street: 'Kololo Hill Road',
    city: 'Kampala',
    state: 'Central Region',
    country: 'Uganda',
    zipCode: '256',
    latitude: 0.3214,
    longitude: 32.5852,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 450,
    rentAmount: 450000,
    rentCurrency: 'UGX',
    securityDeposit: 900000,
    availableDate: '2024-01-15',
    leaseTerm: '6 months',
    images: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800',
      'https://images.unsplash.com/photo-1564012612740-3b5c7c8c1c4c?w=800'
    ],
    amenities: ['WiFi', 'Parking', 'Security', 'Air Conditioning'],
    petPolicy: 'not_allowed',
    furnished: false,
    parkingSpaces: 1,
    parkingType: 'street',
    utilitiesIncluded: ['Security'],
    utilityCosts: 50000,
    agentId: 3,
    status: 'available',
    isFeatured: false,
    isActive: true,
    isVerified: true,
    viewCount: 123,
    messageCount: 28,
    saveCount: 45,
    applicationCount: 8,
    tourCount: 5
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert agents
    console.log('👥 Seeding agents...');
    for (const agent of agents) {
      const hashedPassword = await bcrypt.hash(agent.password, 10);
      
      const agentQuery = `
        INSERT INTO users (
          name, email, phone, password, role, is_active, email_verified,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING RETURNING id
      `;

      await pool.query(agentQuery, [
        agent.name, agent.email, agent.phone, hashedPassword, agent.role,
        true, agent.emailVerified
      ]);

      console.log(`✅ Added agent: ${agent.name}`);
    }

    // Insert properties
    console.log('🏠 Seeding properties...');
    for (const property of properties) {
      const propertyQuery = `
        INSERT INTO properties (
          title, description, street, city, state, country, zip_code,
          bedrooms, bathrooms, square_feet, rent, rent_currency, security_deposit,
          available_date, lease_term, images, amenities, pet_policy, furnished,
          agent_id, status, is_featured, is_active, is_verified,
          view_count, message_count, save_count, application_count,
          tour_count, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27,
          $28, NOW(), NOW()
        )
      `;

      await pool.query(propertyQuery, [
        property.title, property.description, property.street, property.city,
        property.state, property.country, property.zipCode, property.bedrooms,
        property.bathrooms, property.squareFeet, property.rentAmount,
        property.rentCurrency, property.securityDeposit, property.availableDate,
        property.leaseTerm, JSON.stringify(property.images),
        JSON.stringify(property.amenities), property.petPolicy, property.furnished,
        property.agentId, property.status, property.isFeatured,
        property.isActive, property.isVerified, property.viewCount,
        property.messageCount, property.saveCount, property.applicationCount,
        property.tourCount
      ]);

      console.log(`✅ Added property: ${property.title}`);
    }

    // Get final counts
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['agent']);
    const propertyCount = await pool.query('SELECT COUNT(*) as count FROM properties');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary: ${userCount.rows[0].count} agents and ${propertyCount.rows[0].count} properties`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

// Run seeding function
seedDatabase();
