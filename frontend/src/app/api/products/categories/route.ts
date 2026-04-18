import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { getAuthUser } from '@/lib/auth-headers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const cached = cache.get<any[]>('categories');
  if (cached) return NextResponse.json(cached);

  const results = await prisma.product.groupBy({
    by: ['category'],
    where: { available: true },
    _count: true,
  });
  const result = results.map((r) => ({ category: r.category, count: r._count }));
  
  cache.set('categories', result);
  return NextResponse.json(result);
}
