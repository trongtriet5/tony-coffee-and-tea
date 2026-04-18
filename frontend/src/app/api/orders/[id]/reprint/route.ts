import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            toppings: true,
          },
        },
        branch: true,
        table: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order không tồn tại' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { print_count: order.print_count + 1 },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            toppings: true,
          },
        },
        branch: true,
        table: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}