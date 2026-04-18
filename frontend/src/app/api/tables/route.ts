import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get('branch_id');
  const availableOnly = searchParams.get('available') === 'true';

  const where: any = {};
  if (branch_id) where.branch_id = branch_id;
  if (availableOnly) where.status = 'AVAILABLE';

  const tables = await prisma.table.findMany({
    where,
    include: {
      orders: {
        where: { status: { in: ['PENDING', 'COMPLETED'] } },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          items: {
            include: {
              product: true,
              toppings: true,
            },
          },
        },
      },
    },
  });

  const formatted = tables.map((t: any) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    branch_id: t.branch_id,
    area: t.area,
    orders: t.orders.map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      order_type: o.order_type,
      final_amount: o.final_amount,
      created_at: o.created_at,
      items: o.items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        subtotal: item.subtotal,
        product: item.product,
        toppings: item.toppings,
      })),
    })),
  })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  return NextResponse.json(formatted);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const dto = await request.json();
    const existing = await prisma.table.findFirst({
      where: { name: dto.name, branch_id: dto.branch_id || null },
    });

    if (existing) return NextResponse.json({ message: `Bàn "${dto.name}" đã tồn tại` }, { status: 400 });

    const table = await prisma.table.create({
      data: {
        name: dto.name,
        branch_id: dto.branch_id,
        area: dto.area || 'Chung',
        status: 'AVAILABLE',
      },
    });

    return NextResponse.json(table);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
