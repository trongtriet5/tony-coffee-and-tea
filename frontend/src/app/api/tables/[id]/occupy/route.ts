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
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) return NextResponse.json({ message: 'Table not found' }, { status: 404 });

    const updated = await prisma.table.update({
      where: { id },
      data: { status: 'OCCUPIED' },
      include: {
        orders: {
          where: { status: 'PENDING' },
          take: 1,
          orderBy: { created_at: 'desc' },
        },
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      status: updated.status,
      branch_id: updated.branch_id,
      area: updated.area,
      current_order: updated.orders?.[0] ? {
        id: updated.orders[0].id,
        order_number: updated.orders[0].order_number,
        order_type: updated.orders[0].order_type,
      } : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
