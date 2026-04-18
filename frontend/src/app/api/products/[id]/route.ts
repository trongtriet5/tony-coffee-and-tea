import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { getAuthUser } from '@/lib/auth-headers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const data = await request.json();
    const result = await prisma.product.update({
      where: { id },
      data: {
        name_vi: data.name_vi,
        name_en: data.name_en,
        category: data.category,
        available: data.available,
      },
    });
    
    cache.invalidatePattern('products');
    cache.invalidate('categories');
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const orderItemCount = await prisma.orderItem.count({
      where: { product_id: id },
    });
    if (orderItemCount > 0) {
      return NextResponse.json(
        { message: 'Sản phẩm đã có trong lịch sử đơn hàng, không thể xóa hoàn toàn. Vui lòng tắt "Khả dụng" để ẩn món.' },
        { status: 400 }
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: { product_id: id },
    });
    
    // Transactions would be better here, but doing it sequentially for now to match service logic
    for (const v of variants) {
      await prisma.productRecipe.deleteMany({
        where: { variant_id: v.id },
      });
    }
    await prisma.productVariant.deleteMany({ where: { product_id: id } });
    const result = await prisma.product.delete({ where: { id } });
    
    cache.invalidatePattern('products');
    cache.invalidate('categories');
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
