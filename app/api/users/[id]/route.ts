import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';
import { verifyJWT } from '../../../../lib/auth';
import type { User } from '../../../../lib/database';
import * as bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { username, password, role, isActive } = body;

    // Prevent admin from disabling themselves
    if (payload.userId === id && isActive === false) {
      return NextResponse.json(
        { error: 'Cannot disable your own account' },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own role
    if (payload.userId === id && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const updates: Partial<Omit<User, 'id' | 'createdAt'>> = {};

    if (username) {
      // Check if new username already exists (excluding current user)
      const existingUser = await DatabaseService.getUserByUsername(username);
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
      updates.username = username;
    }

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    if (role && ['admin', 'editor'].includes(role)) {
      updates.role = role;
    }

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    const updatedUser = await DatabaseService.updateUser(id, updates);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't return password hash
    const safeUser = {
      ...updatedUser,
      passwordHash: undefined
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (payload.userId === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = await DatabaseService.deleteUser(id);

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}