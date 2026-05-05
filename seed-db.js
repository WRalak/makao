const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Connection configuration
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon database');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const adminResult = await client.query(`
      INSERT INTO users (name, email, password, role, is_active, email_verified) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (email) DO NOTHING 
      RETURNING id
    `, ['Admin User', 'admin@makao.com', adminPassword, 'admin', true, true]);
    
    if (adminResult.rows.length > 0) {
      console.log('✅ Admin user created:', adminResult.rows[0].id);
    }

    // Create agent users
    const agentPassword = await bcrypt.hash('Agent123!', 10);
    const agents = [
      ['John Kamau', 'john@makao.com', '+254712345678', '+254712345678'],
      ['Sarah Nakato', 'sarah@makao.com', '+256712345678', '+256712345678'],
      ['Mohamed Ali', 'mohamed@makao.com', '+255712345678', '+255712345678']
    ];

    const agentIds = [];
    for (const [name, email, phone, mpesaNumber] of agents) {
      const result = await client.query(`
        INSERT INTO users (name, email, password, role, phone, mpesa_number, is_active, email_verified) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        ON CONFLICT (email) DO NOTHING 
        RETURNING id
      `, [name, email, agentPassword, 'agent', phone, mpesaNumber, true, true]);
      
      if (result.rows.length > 0) {
        agentIds.push(result.rows[0].id);
        console.log(`✅ Agent ${name} created:`, result.rows[0].id);
      }
    }

    // Create tenant users
    const tenantPassword = await bcrypt.hash('Tenant123!', 10);
    const tenants = [
      ['Alice Wanjiru', 'alice@makao.com', '+254765432100'],
      ['James Okello', 'james@makao.com', '+256765432100'],
      ['Grace Mwangi', 'grace@makao.com', '+255765432100'],
      ['David Kioko', 'david@makao.com', '+254765432101'],
      ['Fatuma Hassan', 'fatuma@makao.com', '+255765432101']
    ];

    const tenantIds = [];
    for (const [name, email, phone] of tenants) {
      const result = await client.query(`
        INSERT INTO users (name, email, password, role, phone, is_active, email_verified) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT (email) DO NOTHING 
        RETURNING id
      `, [name, email, tenantPassword, 'tenant', phone, true, true]);
      
      if (result.rows.length > 0) {
        tenantIds.push(result.rows[0].id);
        console.log(`✅ Tenant ${name} created:`, result.rows[0].id);
      }
    }

    // Create agent spaces (subscriptions)
    const spaces = [
      ['Basic Plan', 'Up to 10 properties', 1500, 10],
      ['Pro Plan', 'Up to 50 properties', 3500, 50],
      ['Unlimited Plan', 'Unlimited properties', 10000, 999]
    ];

    const spaceIds = [];
    for (let i = 0; i < Math.min(agentIds.length, spaces.length); i++) {
      const [name, description, monthlyFee, propertyLimit] = spaces[i];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const result = await client.query(`
        INSERT INTO spaces (name, description, agent_id, monthly_fee, property_limit, subscription_status, subscription_end_date, is_approved) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id
      `, [name, description, agentIds[i], monthlyFee, propertyLimit, 'active', endDate, true]);
      
      spaceIds.push(result.rows[0].id);
      console.log(`✅ Space ${name} created:`, result.rows[0].id);
    }

    // Create sample properties
    const properties = [
      {
        title: 'Modern 2BR Apartment in Kilimani',
        description: 'Beautiful modern apartment with stunning city views. Close to malls, restaurants, and public transport.',
        street: 'Argwings Kodhek Road',
        city: 'Nairobi',
        state: 'Nairobi County',
        zipCode: '00100',
        country: 'KE',
        latitude: -1.2833,
        longitude: 36.8235,
        rent: 50000,
        rentCurrency: 'KES',
        securityDeposit: 100000,
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
        amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony'],
        petPolicy: 'allowed'
      },
      {
        title: 'Luxury 3BR House in Westlands',
        description: 'Spacious family home with garden and parking. Perfect for families looking for comfort and convenience.',
        street: 'Waiyaki Way',
        city: 'Nairobi',
        state: 'Nairobi County',
        zipCode: '00100',
        country: 'KE',
        latitude: -1.2691,
        longitude: 36.8118,
        rent: 85000,
        rentCurrency: 'KES',
        securityDeposit: 170000,
        bedrooms: 3,
        bathrooms: 3,
        squareFeet: 2000,
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
        amenities: ['Garden', 'Parking', 'Security', 'Storage', 'Laundry'],
        petPolicy: 'restricted'
      },
      {
        title: 'Cozy 1BR in Kololo, Kampala',
        description: 'Perfect starter apartment in prime Kampala location. Walking distance to restaurants and shops.',
        street: 'Kololo Hill Road',
        city: 'Kampala',
        state: 'Central Region',
        zipCode: '256',
        country: 'UG',
        latitude: 0.3176,
        longitude: 32.5825,
        rent: 1200000,
        rentCurrency: 'UGX',
        securityDeposit: 2400000,
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 800,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1502672260266-a1f353004b55?w=800'],
        amenities: ['Parking', 'Security', 'Air Conditioning', 'WiFi'],
        petPolicy: 'not-allowed'
      },
      {
        title: 'Beachfront Villa in Masaki, Dar es Salaam',
        description: 'Luxury beachfront property with ocean views. Perfect for those who love coastal living.',
        street: 'Masaki Beach Road',
        city: 'Dar es Salaam',
        state: 'Dar es Salaam Region',
        zipCode: '255',
        country: 'TZ',
        latitude: -6.7793,
        longitude: 39.2085,
        rent: 3500000,
        rentCurrency: 'TZS',
        securityDeposit: 7000000,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 3000,
        images: ['https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800', 'https://images.unsplash.com/photo-1600047509807-ba8f500d2b4a?w=800'],
        amenities: ['Beach Access', 'Pool', 'Garden', 'Parking', 'Security', 'Generator'],
        petPolicy: 'allowed'
      }
    ];

    const propertyIds = [];
    for (let i = 0; i < Math.min(agentIds.length, properties.length); i++) {
      const prop = properties[i];
      const result = await client.query(`
        INSERT INTO properties (
          title, description, agent_id, street, city, state, zip_code, country, 
          latitude, longitude, rent, rent_currency, security_deposit, bedrooms, 
          bathrooms, square_feet, images, amenities, pet_policy, available_date, 
          status, featured, is_approved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING id
      `, [
        prop.title, prop.description, agentIds[i], prop.street, prop.city, prop.state, 
        prop.zipCode, prop.country, prop.latitude, prop.longitude, prop.rent, 
        prop.rentCurrency, prop.securityDeposit, prop.bedrooms, prop.bathrooms, 
        prop.squareFeet, JSON.stringify(prop.images), JSON.stringify(prop.amenities), 
        prop.petPolicy, new Date(), 'available', i === 0, true
      ]);
      
      propertyIds.push(result.rows[0].id);
      console.log(`✅ Property ${prop.title} created:`, result.rows[0].id);
    }

    // Create sample messages
    if (propertyIds.length > 0 && tenantIds.length > 0) {
      await client.query(`
        INSERT INTO messages (sender_id, receiver_id, property_id, content, is_read) 
        VALUES ($1, $2, $3, $4, $5)
      `, [tenantIds[0], agentIds[0], propertyIds[0], 'Hi, I\'m interested in this apartment. Is it still available?', false]);
      
      await client.query(`
        INSERT INTO messages (sender_id, receiver_id, property_id, content, is_read) 
        VALUES ($1, $2, $3, $4, $5)
      `, [agentIds[0], tenantIds[0], propertyIds[0], 'Hello! Yes, the apartment is still available. Would you like to schedule a viewing?', true]);
      
      console.log('✅ Sample messages created');
    }

    // Create sample payments
    for (let i = 0; i < Math.min(agentIds.length, spaceIds.length); i++) {
      const paymentAmount = [1500, 3500, 10000][i];
      await client.query(`
        INSERT INTO payments (agent_id, space_id, amount, currency, status, payment_method, transaction_id, description, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [agentIds[i], spaceIds[i], paymentAmount, 'KES', 'completed', 'mpesa', `MPESA00${i + 1}`, ['Basic Plan Subscription', 'Pro Plan Subscription', 'Unlimited Plan Subscription'][i], 'subscription']);
    }
    
    console.log('✅ Sample payments created');

    client.release();
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Agent users: ${agentIds.length}`);
    console.log(`- Tenant users: ${tenantIds.length}`);
    console.log(`- Agent spaces: ${spaceIds.length}`);
    console.log(`- Properties: ${propertyIds.length}`);
    console.log(`- Messages: 2`);
    console.log(`- Payments: ${spaceIds.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
