import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { getAuthUser } from '@/lib/auth-headers';

const CACHE_KEYS = {
  PRODUCTS_ALL: 'products:all',
  PRODUCTS_AVAILABLE: 'products:available',
  CATEGORIES: 'categories',
};

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const includeUnavailable = searchParams.get('all') === 'true';

  const cacheKey = includeUnavailable ? CACHE_KEYS.PRODUCTS_ALL : CACHE_KEYS.PRODUCTS_AVAILABLE;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const products = await prisma.product.findMany({
    where: includeUnavailable ? undefined : { available: true },
    include: {
      variants: {
        include: {
          recipes: { take: 1 },
        },
      },
    },
    orderBy: [{ category: 'asc' }, { name_vi: 'asc' }],
  });

  const result = products.map((p) => {
    let productHasRecipe = false;
    const enrichedVariants = p.variants.map((v) => {
      const hasRecipe = v.recipes.length > 0;
      if (hasRecipe) productHasRecipe = true;
      return { ...v, cost: 0, has_recipe: hasRecipe };
    });
    return { ...p, variants: enrichedVariants, has_recipe: productHasRecipe };
  });

  cache.set(cacheKey, result);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const result = await prisma.product.create({
      data: {
        name_vi: data.name_vi,
        name_en: data.name_en,
        category: data.category,
        available: data.available ?? true,
        variants: {
          create: data.variants || [],
        },
      },
      include: { variants: true },
    });
    
    cache.invalidatePattern('products');
    cache.invalidate(CACHE_KEYS.CATEGORIES);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
