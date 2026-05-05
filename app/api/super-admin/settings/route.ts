import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  description: z.string().optional(),
  category: z.string(),
  isPublic: z.boolean().default(false),
  validationRules: z.object({}).optional()
});

// GET - Fetch system settings
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public');

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    let query = 'SELECT * FROM system_settings';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    if (isPublic !== null) {
      const operator = params.length > 0 ? ' AND' : ' WHERE';
      query += ` ${operator} is_public = $${params.length + 1}`;
      params.push(isPublic === 'true');
    }

    query += ' ORDER BY category, key';

    const result = await pool!.query(query, params);

    // Group settings by category
    const settings: Record<string, any> = {};
    result.rows.forEach(setting => {
      if (!settings[setting.category]) {
        settings[setting.category] = {};
      }
      
      let parsedValue = setting.value;
      if (setting.type === 'number') {
        parsedValue = parseFloat(setting.value);
      } else if (setting.type === 'boolean') {
        parsedValue = setting.value === 'true';
      } else if (setting.type === 'json') {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch (e) {
          parsedValue = setting.value;
        }
      }

      settings[setting.category][setting.key] = {
        value: parsedValue,
        type: setting.type,
        description: setting.description,
        isPublic: setting.is_public,
        validationRules: setting.validation_rules ? JSON.parse(setting.validation_rules) : null,
        updatedAt: setting.updated_at
      };
    });

    return NextResponse.json({
      settings,
      categories: Object.keys(settings)
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update system setting
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Check if setting already exists
    const existingResult = await pool!.query(
      'SELECT id FROM system_settings WHERE key = $1',
      [validatedData.key]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing setting
      result = await pool!.query(
        `UPDATE system_settings SET 
         value = $1, type = $2, description = $3, category = $4, 
         is_public = $5, validation_rules = $6, updated_at = NOW(),
         updated_by = $7
         WHERE key = $8
         RETURNING *`,
        [
          validatedData.value,
          validatedData.type,
          validatedData.description || null,
          validatedData.category,
          validatedData.isPublic,
          validatedData.validationRules ? JSON.stringify(validatedData.validationRules) : null,
          decoded.userId,
          validatedData.key
        ]
      );
    } else {
      // Create new setting
      result = await pool!.query(
        `INSERT INTO system_settings (
          key, value, type, description, category, is_public, 
          validation_rules, created_at, updated_at, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8)
        RETURNING *`,
        [
          validatedData.key,
          validatedData.value,
          validatedData.type,
          validatedData.description || null,
          validatedData.category,
          validatedData.isPublic,
          validatedData.validationRules ? JSON.stringify(validatedData.validationRules) : null,
          decoded.userId
        ]
      );
    }

    const setting = result.rows[0];

    // Create admin log
    await pool!.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, details, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [
        decoded.userId,
        existingResult.rows.length > 0 ? 'update_setting' : 'create_setting',
        'system_setting',
        JSON.stringify({
          key: validatedData.key,
          oldValue: existingResult.rows.length > 0 ? 'existing' : null,
          newValue: validatedData.value,
          category: validatedData.category
        })
      ]
    );

    return NextResponse.json({
      message: 'Setting saved successfully',
      setting: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
        category: setting.category,
        isPublic: setting.is_public,
        updatedAt: setting.updated_at
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Settings save error:', error);
    return NextResponse.json(
      { error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

// DELETE - Delete system setting
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Get setting before deletion for logging
    const settingResult = await pool!.query(
      'SELECT * FROM system_settings WHERE key = $1',
      [key]
    );

    if (settingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    // Delete the setting
    await pool!.query('DELETE FROM system_settings WHERE key = $1', [key]);

    // Create admin log
    await pool!.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, details, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [
        decoded.userId,
        'delete_setting',
        'system_setting',
        JSON.stringify({
          key: key,
          deletedValue: settingResult.rows[0].value,
          category: settingResult.rows[0].category
        })
      ]
    );

    return NextResponse.json({
      message: 'Setting deleted successfully'
    });

  } catch (error) {
    console.error('Settings delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}

// PUT - Bulk update settings
export async function PUT(request: NextRequest) {
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

    const { settings } = await request.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 });
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    const results = [];

    for (const settingData of settings) {
      try {
        const validatedData = settingsSchema.parse(settingData);

        // Check if setting exists
        const existingResult = await pool!.query(
          'SELECT id FROM system_settings WHERE key = $1',
          [validatedData.key]
        );

        let result;
        if (existingResult.rows.length > 0) {
          // Update existing setting
          result = await pool!.query(
            `UPDATE system_settings SET 
             value = $1, type = $2, description = $3, category = $4, 
             is_public = $5, validation_rules = $6, updated_at = NOW(),
             updated_by = $7
             WHERE key = $8
             RETURNING *`,
            [
              validatedData.value,
              validatedData.type,
              validatedData.description || null,
              validatedData.category,
              validatedData.isPublic,
              validatedData.validationRules ? JSON.stringify(validatedData.validationRules) : null,
              decoded.userId,
              validatedData.key
            ]
          );
        } else {
          // Create new setting
          result = await pool!.query(
            `INSERT INTO system_settings (
              key, value, type, description, category, is_public, 
              validation_rules, created_at, updated_at, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8)
            RETURNING *`,
            [
              validatedData.key,
              validatedData.value,
              validatedData.type,
              validatedData.description || null,
              validatedData.category,
              validatedData.isPublic,
              validatedData.validationRules ? JSON.stringify(validatedData.validationRules) : null,
              decoded.userId
            ]
          );
        }

        results.push({
          key: validatedData.key,
          status: 'success',
          action: existingResult.rows.length > 0 ? 'updated' : 'created'
        });

      } catch (error) {
        results.push({
          key: settingData.key,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Create admin log for bulk update
    await pool!.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, details, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [
        decoded.userId,
        'bulk_update_settings',
        'system_setting',
        JSON.stringify({
          settingsCount: settings.length,
          successCount: results.filter(r => r.status === 'success').length,
          errorCount: results.filter(r => r.status === 'error').length
        })
      ]
    );

    return NextResponse.json({
      message: 'Bulk update completed',
      results,
      summary: {
        total: settings.length,
        success: results.filter(r => r.status === 'success').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Bulk settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
