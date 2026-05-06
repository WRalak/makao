import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract role from decoded token (handle both string and object cases)
    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;
    
    if (!userRole || userRole !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      // Return comprehensive mock data when database connection fails
      return NextResponse.json({
        stats: {
          totalUsers: { super_admin: 1, admin: 3, agent: 45, tenant: 1250 },
          totalRevenue: { KES: 2500000, UGX: 7500000, TZS: 12000000, USD: 20000, total: 2500000 },
          platformHealth: {
            serverUptime: 99.9,
            apiResponseTime: 145,
            databaseConnections: 3,
            errorRate: 0.1,
            activeUsers: 67
          },
          systemSettings: {
            platformName: 'Makao',
            maintenanceMode: false,
            version: '1.0.0',
            backupEnabled: true,
            cacheEnabled: true
          },
          recentActivities: [
            {
              type: 'user_created',
              user: 'Admin',
              action: 'Created admin account',
              target: 'John Doe',
              timestamp: '2026-05-03T10:30:00Z',
              details: 'Admin account created for John Doe'
            },
            {
              type: 'payment_received',
              user: 'Jane Smith',
              action: 'Subscription payment',
              target: 'Pro Plan',
              timestamp: '2026-05-03T09:15:00Z',
              details: 'KES 3,500 payment received from Jane Smith'
            },
            {
              type: 'space_approved',
              user: 'Admin',
              action: 'Approved agent space',
              target: 'Nairobi Luxury Rentals',
              timestamp: '2026-05-03T08:45:00Z',
              details: 'Agent space approved after document verification'
            },
            {
              type: 'system_backup',
              user: 'Super Admin',
              action: 'Database backup completed',
              target: 'Production Database',
              timestamp: '2026-05-03T07:00:00Z',
              details: 'Database backup completed successfully'
            },
            {
              type: 'maintenance_mode',
              user: 'Super Admin',
              action: 'Maintenance mode toggled',
              target: 'Platform',
              timestamp: '2026-05-02T23:00:00Z',
              details: 'Maintenance mode disabled'
            }
          ],
          systemAlerts: [
            {
              type: 'warning',
              message: 'Database connection high usage detected',
              timestamp: '2026-05-03T11:30:00Z',
              resolved: false
            },
            {
              type: 'info',
              message: 'System health check completed successfully',
              timestamp: '2026-05-03T10:00:00Z',
              resolved: true
            }
          ]
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        usingFallback: true
      });
    }

    // Get comprehensive platform statistics
    const [
      userStats,
      revenueStats,
      platformHealthQuery,
      systemSettings,
      recentActivities,
      systemAlerts
    ] = await Promise.all([
      // User statistics by role
      pool.query(`
        SELECT 
          role,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'active') as active_count,
          COUNT(*) FILTER (WHERE status = 'banned') as banned_count
        FROM users 
        GROUP BY role
      `),
      
      // Revenue statistics by currency
      pool.query(`
        SELECT 
          currency, 
          COALESCE(SUM(amount), 0) as total,
          COUNT(*) as transaction_count
        FROM payments 
        WHERE status = 'completed'
        GROUP BY currency
      `),
      
      // Platform health metrics
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          EXTRACT(EPOCH FROM (SELECT pg_postmaster_start_time())) / 60 as uptime_minutes,
          (SELECT COUNT(*) FROM users WHERE last_login >= CURRENT_DATE - INTERVAL '1 hour') as active_users
      `),
      
      // System settings
      pool.query(`
        SELECT key, value, type FROM system_settings WHERE category = 'general'
      `),
      
      // Recent activities (last 10)
      pool.query(`
        SELECT 
          al.action,
          al.details,
          u.name as user_name,
          al.created_at
        FROM admin_logs al
        JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
      `),
      
      // System alerts (unresolved)
      pool.query(`
        SELECT 
          type,
          message,
          created_at,
          resolved
        FROM system_alerts
        WHERE resolved = false
        ORDER BY created_at DESC
        LIMIT 5
      `)
    ]);

    // Format user statistics
    const totalUsers = {
      super_admin: 0,
      admin: 0,
      agent: 0,
      tenant: 0,
      total: 0
    };
    
    userStats.rows.forEach(row => {
      totalUsers[row.role as keyof typeof totalUsers] = parseInt(row.count);
      totalUsers.total += parseInt(row.count);
    });

    // Format revenue statistics
    const totalRevenue = {
      KES: 0,
      UGX: 0,
      TZS: 0,
      USD: 0,
      total: 0
    };
    
    revenueStats.rows.forEach(row => {
      totalRevenue[row.currency as keyof typeof totalRevenue] = parseFloat(row.total);
      totalRevenue.total += parseFloat(row.total);
    });

    // Format platform health
    const platformHealthData = platformHealthQuery.rows[0] || {};
    const platformHealth = {
      serverUptime: 99.9, // Mock data - would calculate from uptime_minutes
      apiResponseTime: 145, // Mock data - would measure actual response time
      databaseConnections: platformHealthData.active_connections || 3,
      errorRate: 0.1, // Mock data - would calculate from error logs
      activeUsers: platformHealthData.active_users || 67
    };

    // Format system settings
    const systemSettingsData = {
      platformName: 'Makao',
      maintenanceMode: false,
      version: '1.0.0',
      backupEnabled: true,
      cacheEnabled: true
    };
    
    systemSettings.rows.forEach(setting => {
      if (setting.key === 'platform_name') systemSettingsData.platformName = setting.value;
      if (setting.key === 'maintenance_mode') systemSettingsData.maintenanceMode = setting.value === 'true';
      if (setting.key === 'platform_version') systemSettingsData.version = setting.value;
      if (setting.key === 'backup_enabled') systemSettingsData.backupEnabled = setting.value === 'true';
      if (setting.key === 'cache_enabled') systemSettingsData.cacheEnabled = setting.value === 'true';
    });

    // Format recent activities
    const formattedActivities = recentActivities.rows.map(log => ({
      type: log.action,
      user: log.user_name,
      action: log.action,
      target: log.details?.target || 'System',
      timestamp: log.created_at,
      details: log.details?.description || log.action
    }));

    // Format system alerts
    const formattedAlerts = systemAlerts.rows.map(alert => ({
      type: alert.type as 'error' | 'warning' | 'info',
      message: alert.message,
      timestamp: alert.created_at,
      resolved: alert.resolved
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalRevenue,
        platformHealth,
        systemSettings: systemSettingsData,
        recentActivities: formattedActivities,
        systemAlerts: formattedAlerts
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      usingFallback: false
    });

  } catch (error) {
    console.error('Super Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load Super Admin dashboard data' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
