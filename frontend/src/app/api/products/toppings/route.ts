import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { getAuthUser } from '@/lib/auth-headers';

export async function GET(request: Request) {
  const user = await getAuthUser();
  // Don't require auth - return empty array if not authenticated
  if (!user) return NextResponse.json([]);

  const { searchParams } = new URL(request.url);
  const includeUnavailable = searchParams.get('all') === 'true';
  const bypassCache = searchParams.get('refresh') === 'true';

  const cacheKey = includeUnavailable ? 'toppings:all' : 'toppings:available';
  
  if (!bypassCache) {
    const cached = cache.get<any[]>(cacheKey);
    if (cached) return NextResponse.json(cached);
  }

  const toppings = await prisma.topping.findMany({
    where: includeUnavailable ? undefined : { available: true },
    include: { recipes: { take: 1 } },
    orderBy: { name: 'asc' },
  });

  const result = toppings.map((t) => ({
    ...t,
    cost: 0,
    has_recipe: t.recipes.length > 0,
  }));

  cache.set(cacheKey, result);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const result = await prisma.topping.create({
      data: {
        name: data.name,
        price: data.price,
        available: data.available ?? true,
      },
    });
    
    cache.invalidatePattern('toppings');
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
