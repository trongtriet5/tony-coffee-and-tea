import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const branches = await prisma.branch.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(branches);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized or insufficient permissions' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const branch = await prisma.branch.create({
      data: body,
    });
    return NextResponse.json(branch);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
