const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/makao_db',
});

async function setupCompletePlatform() {
  console.log('🚀 Setting up complete Makao Platform...\n');

  try {
    // Check database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read and execute the complete schema
    const schemaPath = path.join(__dirname, '../migrations/complete_platform_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Creating database schema...');
    await pool.query(schemaSQL);
    console.log('✅ Database schema created successfully');

    // Insert initial system settings
    console.log('⚙️ Setting up system settings...');
    await setupSystemSettings();

    // Insert commission rates
    console.log('💰 Setting up commission rates...');
    await setupCommissionRates();

    // Insert notification templates
    console.log('📧 Setting up notification templates...');
    await setupNotificationTemplates();

    // Create super admin user
    console.log('👑 Creating super admin user...');
    await createSuperAdmin();

    // Insert sample analytics data
    console.log('📊 Setting up analytics data...');
    await setupAnalytics();

    console.log('\n🎉 Makao Platform setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Configure your environment variables (see env-example-complete.txt)');
    console.log('2. Run: npm install');
    console.log('3. Run: npm run dev');
    console.log('4. Visit: http://localhost:3000');
    console.log('\n🔑 Default super admin credentials:');
    console.log('Email: admin@makao.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function setupSystemSettings() {
  const settings = [
    // Platform settings
    { key: 'platform_name', value: 'Makao', type: 'string', category: 'platform', description: 'Platform name' },
    { key: 'platform_version', value: '1.0.0', type: 'string', category: 'platform', description: 'Platform version' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'platform', description: 'Enable maintenance mode' },
    
    // Email settings
    { key: 'email_verification_required', value: 'true', type: 'boolean', category: 'email', description: 'Require email verification' },
    { key: 'email_welcome_enabled', value: 'true', type: 'boolean', category: 'email', description: 'Send welcome emails' },
    { key: 'email_notifications_enabled', value: 'true', type: 'boolean', category: 'email', description: 'Enable email notifications' },
    
    // Payment settings
    { key: 'stripe_enabled', value: 'true', type: 'boolean', category: 'payment', description: 'Enable Stripe payments' },
    { key: 'mpesa_enabled', value: 'true', type: 'boolean', category: 'payment', description: 'Enable M-PESA payments' },
    { key: 'auto_approve_payments', value: 'false', type: 'boolean', category: 'payment', description: 'Auto-approve payments' },
    
    // Property settings
    { key: 'max_property_images', value: '20', type: 'number', category: 'property', description: 'Maximum property images' },
    { key: 'auto_approve_properties', value: 'false', type: 'boolean', category: 'property', description: 'Auto-approve properties' },
    { key: 'featured_property_price', value: '29.99', type: 'number', category: 'property', description: 'Featured listing price' },
    
    // Agent settings
    { key: 'agent_approval_required', value: 'true', type: 'boolean', category: 'agent', description: 'Require agent approval' },
    { key: 'free_trial_days', value: '7', type: 'number', category: 'agent', description: 'Free trial period in days' },
    { key: 'max_agents_per_ip', value: '3', type: 'number', category: 'agent', description: 'Max agent registrations per IP' },
    
    // Security settings
    { key: 'max_login_attempts', value: '5', type: 'number', category: 'security', description: 'Max login attempts' },
    { key: 'account_lockout_minutes', value: '30', type: 'number', category: 'security', description: 'Account lockout duration' },
    { key: 'password_min_length', value: '8', type: 'number', category: 'security', description: 'Minimum password length' },
    
    // API settings
    { key: 'api_rate_limit', value: '100', type: 'number', category: 'api', description: 'API rate limit per minute' },
    { key: 'api_timeout_seconds', value: '30', type: 'number', category: 'api', description: 'API request timeout' },
    { key: 'enable_api_docs', value: 'true', type: 'boolean', category: 'api', description: 'Enable API documentation' }
  ];

  for (const setting of settings) {
    await pool.query(`
      INSERT INTO system_settings (key, value, type, category, description, is_public, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `, [setting.key, setting.value, setting.type, setting.category, setting.description, false]);
  }
}

async function setupCommissionRates() {
  const rates = [
    // Basic commission rates
    { category: 'subscription', rateType: 'percentage', rate: 20.00, currency: 'USD', userRole: 'agent' },
    { category: 'application_fee', rateType: 'fixed', rate: 25.00, currency: 'USD', userRole: 'tenant' },
    { category: 'featured_listing', rateType: 'fixed', rate: 29.99, currency: 'USD', userRole: 'agent' },
    
    // Premium agent rates
    { category: 'subscription', rateType: 'percentage', rate: 15.00, currency: 'USD', userRole: 'agent', userTier: 'premium' },
    { category: 'application_fee', rateType: 'fixed', rate: 20.00, currency: 'USD', userRole: 'tenant', userTier: 'premium' },
    
    // Volume discounts
    { category: 'subscription', rateType: 'percentage', rate: 10.00, currency: 'USD', userRole: 'agent', minAmount: 1000 },
    { category: 'application_fee', rateType: 'fixed', rate: 15.00, currency: 'USD', userRole: 'tenant', minAmount: 500 }
  ];

  for (const rate of rates) {
    await pool.query(`
      INSERT INTO commission_rates (category, rate_type, rate, currency, user_role, user_tier, min_amount, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, [
      rate.category,
      rate.rateType,
      rate.rate,
      rate.currency || 'USD',
      rate.userRole,
      rate.userTier || null,
      rate.minAmount || null,
      true
    ]);
  }
}

async function setupNotificationTemplates() {
  const templates = [
    // Welcome emails
    {
      name: 'welcome_agent',
      type: 'email',
      category: 'welcome',
      subject: 'Welcome to Makao - Your Agent Journey Begins!',
      content: 'Hi {{name}}, welcome to Makao! Your agent account has been created. Get started by creating your space and listing your first property.',
      variables: ['name']
    },
    {
      name: 'welcome_tenant',
      type: 'email',
      category: 'welcome',
      subject: 'Welcome to Makao - Find Your Perfect Home!',
      content: 'Hi {{name}}, welcome to Makao! Start searching for your perfect rental property and connect with verified agents.',
      variables: ['name']
    },
    
    // Space approval notifications
    {
      name: 'space_approved',
      type: 'email',
      category: 'space',
      subject: 'Your Space Has Been Approved! 🎉',
      content: 'Congratulations {{agentName}}! Your space "{{spaceName}}" has been approved. You can now activate your subscription and start listing properties.',
      variables: ['agentName', 'spaceName']
    },
    {
      name: 'space_rejected',
      type: 'email',
      category: 'space',
      subject: 'Space Application Status Update',
      content: 'Hi {{agentName}}, your space application "{{spaceName}}" has been reviewed. Reason: {{reason}}. Please update your information and resubmit.',
      variables: ['agentName', 'spaceName', 'reason']
    },
    
    // Application notifications
    {
      name: 'application_received',
      type: 'email',
      category: 'application',
      subject: 'New Rental Application Received',
      content: 'Hi {{agentName}}, you have received a new rental application for "{{propertyTitle}}" from {{tenantName}}. Review it in your dashboard.',
      variables: ['agentName', 'propertyTitle', 'tenantName']
    },
    {
      name: 'application_approved',
      type: 'email',
      category: 'application',
      subject: 'Your Rental Application Has Been Approved! 🎉',
      content: 'Congratulations {{tenantName}}! Your application for "{{propertyTitle}}" has been approved. Contact the agent to proceed with the next steps.',
      variables: ['tenantName', 'propertyTitle']
    },
    {
      name: 'application_rejected',
      type: 'email',
      category: 'application',
      subject: 'Application Status Update',
      content: 'Hi {{tenantName}}, your application for "{{propertyTitle}}" has been reviewed. Reason: {{reason}}.',
      variables: ['tenantName', 'propertyTitle', 'reason']
    },
    
    // Payment notifications
    {
      name: 'payment_successful',
      type: 'email',
      category: 'payment',
      subject: 'Payment Successful ✅',
      content: 'Hi {{name}}, your payment of ${{amount}} for {{description}} has been processed successfully.',
      variables: ['name', 'amount', 'description']
    },
    {
      name: 'payment_failed',
      type: 'email',
      category: 'payment',
      subject: 'Payment Failed ❌',
      content: 'Hi {{name}}, your payment for {{description}} could not be processed. Please try again or contact support.',
      variables: ['name', 'description']
    },
    
    // Message notifications
    {
      name: 'new_message',
      type: 'email',
      category: 'messaging',
      subject: 'New Message from {{senderName}}',
      content: 'Hi {{recipientName}}, you have received a new message from {{senderName}} regarding "{{propertyTitle}}".',
      variables: ['recipientName', 'senderName', 'propertyTitle']
    }
  ];

  for (const template of templates) {
    await pool.query(`
      INSERT INTO notification_templates (name, type, category, subject, content, variables, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET
        subject = EXCLUDED.subject,
        content = EXCLUDED.content,
        updated_at = NOW()
    `, [
      template.name,
      template.type,
      template.category,
      template.subject,
      template.content,
      JSON.stringify(template.variables),
      true
    ]);
  }
}

async function createSuperAdmin() {
  const bcrypt = require('bcrypt');
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 12);

  await pool.query(`
    INSERT INTO users (
      name, email, password, role, status, is_active, is_verified, is_approved,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      NOW(), NOW()
    )
    ON CONFLICT (email) DO NOTHING
  `, [
    'Super Admin',
    'admin@makao.com',
    hashedPassword,
    'super_admin',
    'active',
    true,
    true,
    true
  ]);
}

async function setupAnalytics() {
  const analytics = [
    // Platform metrics
    { metricName: 'total_users', metricType: 'count', metricValue: 1, dateTrunc: 'day' },
    { metricName: 'total_properties', metricType: 'count', metricValue: 0, dateTrunc: 'day' },
    { metricName: 'total_spaces', metricType: 'count', metricValue: 0, dateTrunc: 'day' },
    { metricName: 'total_revenue', metricType: 'revenue', metricValue: 0, dateTrunc: 'day', currency: 'USD' },
    
    // User activity
    { metricName: 'daily_active_users', metricType: 'count', metricValue: 0, dateTrunc: 'day' },
    { metricName: 'new_registrations', metricType: 'count', metricValue: 0, dateTrunc: 'day' },
    { metricName: 'property_views', metricType: 'count', metricValue: 0, dateTrunc: 'day' },
    { metricName: 'messages_sent', metricType: 'count', metricValue: 0, dateTrunc: 'day' }
  ];

  for (const metric of analytics) {
    await pool.query(`
      INSERT INTO analytics (
        metric_name, metric_type, metric_value, metric_unit,
        date_trunc, date_value, currency, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW())
      ON CONFLICT DO NOTHING
    `, [
      metric.metricName,
      metric.metricType,
      metric.metricValue,
      metric.metricUnit || null,
      metric.dateTrunc,
      metric.currency || null
    ]);
  }
}

// Run the setup
if (require.main === module) {
  setupCompletePlatform();
}

module.exports = { setupCompletePlatform };
