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
    const result = await prisma.topping.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        available: data.available,
      },
    });
    
    cache.invalidatePattern('toppings');
    
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
    const orderItemToppingCount = await prisma.orderItemTopping.count({
      where: { topping_id: id },
    });
    if (orderItemToppingCount > 0) {
      return NextResponse.json(
        { message: 'Topping đã có trong lịch sử đơn hàng, không thể xóa hoàn toàn. Vui lòng tắt "Khả dụng" để ẩn.' },
        { status: 400 }
      );
    }

    await prisma.toppingRecipe.deleteMany({ where: { topping_id: id } });
    const result = await prisma.topping.delete({ where: { id } });
    
    cache.invalidatePattern('toppings');
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
