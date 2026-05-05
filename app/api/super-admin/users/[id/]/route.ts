import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'agent', 'tenant']).optional(),
  status: z.enum(['active', 'banned', 'suspended', 'inactive']).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (validatedData.email && validatedData.email !== existingUser.rows[0].email) {
      const emailExists = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [validatedData.email, userId]
      );

      if (emailExists.rows.length > 0) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (validatedData.name) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(validatedData.name);
    }
    if (validatedData.email) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(validatedData.email);
    }
    if (validatedData.phone) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(validatedData.phone);
    }
    if (validatedData.role) {
      updateFields.push(`role = $${paramIndex++}`);
      updateValues.push(validatedData.role);
    }
    if (validatedData.status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(validatedData.status);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(userId);

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
    
    const result = await pool.query(updateQuery, updateValues);

    // Log the action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [
        decoded.userId,
        'user_updated',
        JSON.stringify({
          target_user_id: userId,
          changes: validatedData,
          updated_by: decoded.name
        })
      ]
    );

    return NextResponse.json({
      message: 'User updated successfully',
      user: { ...existingUser.rows[0], ...validatedData }
    });

  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const userId = parseInt(params.id);

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Check if user exists and is not a super admin
    const existingUser = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.rows[0].role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete Super Admin account' }, { status: 403 });
    }

    // Delete user (cascade delete will handle related records)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // Log the action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [
        decoded.userId,
        'user_deleted',
        JSON.stringify({
          target_user_id: userId,
          target_user_name: existingUser.rows[0].name,
          target_user_email: existingUser.rows[0].email,
          deleted_by: decoded.name
        })
      ]
    );

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}


export const runtime = 'nodejs';
