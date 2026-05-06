const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testPropertiesQuery() {
  try {
    console.log('🔍 Testing properties query...');
    
    const baseQuery = `
      SELECT 
        p.id, p.title, p.description, p.street, p.city, p.state, p.country,
        p.zip_code, p.bedrooms, p.bathrooms, p.square_feet,
        p.rent, p.rent_currency, p.security_deposit, p.available_date,
        p.lease_term, p.images, p.amenities, p.pet_policy, p.furnished,
        p.agent_id, p.status, p.is_featured, p.is_active, p.is_verified,
        p.view_count, p.message_count, p.save_count, p.application_count,
        p.tour_count, p.slug, p.meta_title, p.meta_description,
        p.created_at, p.updated_at,
        u.name as agent_name, u.email as agent_email, u.phone as agent_phone
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.is_active = true AND p.status = 'available'
      ORDER BY p.created_at DESC LIMIT 3 OFFSET 0
    `;

    const result = await pool.query(baseQuery);
    console.log('✅ Query successful!');
    console.log(`📊 Found ${result.rows.length} properties:`);
    
    result.rows.forEach((prop, index) => {
      console.log(`\n${index + 1}. ${prop.title}`);
      console.log(`   📍 ${prop.street}, ${prop.city}`);
      console.log(`   💰 ${prop.rent} ${prop.rent_currency}`);
      console.log(`   🛏️ ${prop.bedrooms} bed, ${prop.bathrooms} bath`);
      console.log(`   👤 Agent: ${prop.agent_name || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

testPropertiesQuery();
