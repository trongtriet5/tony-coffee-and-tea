import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const recipes = await prisma.productRecipe.findMany({
    include: {
      variant: { include: { product: true } },
      material: true,
    },
    orderBy: [
      { variant: { product: { name_vi: 'asc' } } },
      { variant: { size: 'asc' } },
      { material: { name: 'asc' } },
    ],
  });

  const data = recipes.map(r => [
    r.variant.product.name_vi,
    r.variant.size,
    r.material.name,
    r.quantity,
    r.material.unit,
    r.quantity * r.material.cost_per_unit,
  ]);

  const headers = ['Tên sản phẩm', 'Size', 'Tên nguyên liệu', 'Định lượng', 'Đơn vị', 'Chi phí'];
  
  return NextResponse.json([headers, ...data]);
}