import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = await prisma.employee.findUnique({
      where: { username },
      include: { branch: true },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = {
        username: user.username,
        sub: user.id,
        role: user.role,
        branch_id: user.branch_id,
      };

      const token = await encrypt(payload);

      return NextResponse.json({
        access_token: token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          branch_id: user.branch_id,
          branch_name: user?.branch?.name,
        },
      });
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
