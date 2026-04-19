import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { getAuthUser } from '@/lib/auth-headers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

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
    await prisma.toppingRecipe.deleteMany({ where: { topping_id: id } });
    const result = await prisma.topping.delete({ where: { id } });
    
    cache.invalidatePattern('toppings');
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}