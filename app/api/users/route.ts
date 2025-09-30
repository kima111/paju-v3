import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database-service';
import { verifyJWT } from '../../../lib/auth';
import * as bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
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

    const users = await DatabaseService.getUsers();
    
    // Don't return password hashes
    const safeUsers = users.map(user => ({
      ...user,
      passwordHash: undefined
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { username, password, role, isActive = true } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'editor'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be admin or editor' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await DatabaseService.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await DatabaseService.createUser({
      username,
      passwordHash,
      role,
      isActive
    });

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Don't return password hash
    const safeUser = {
      ...newUser,
      passwordHash: undefined
    };

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}