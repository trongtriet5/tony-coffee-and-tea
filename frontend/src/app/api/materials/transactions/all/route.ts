import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get('branch_id');
  const limit = parseInt(searchParams.get('limit') || '100');

  const where: any = {};
  if (branch_id) {
    where.material = { branch_id };
  }

  const transactions = await prisma.materialTransaction.findMany({
    where,
    take: limit,
    orderBy: { created_at: 'desc' },
    include: { material: { select: { name: true, unit: true } } },
  });

  return NextResponse.json(transactions);
}
