import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id: fromTableId } = await params;
  try {
    const { to_table_id: toTableId } = await request.json();

    if (fromTableId === toTableId) {
      return NextResponse.json({ message: 'Không thể chuyển đơn sang cùng một bàn' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const fromTable = await tx.table.findUnique({
        where: { id: fromTableId },
        include: { orders: { where: { status: 'PENDING' }, take: 1 } },
      });

      if (!fromTable) throw new Error(`Không tìm thấy bàn nguồn với ID ${fromTableId}`);
      if (fromTable.status !== 'OCCUPIED') throw new Error('Bàn nguồn đang trống, không thể chuyển');

      const toTable = await tx.table.findUnique({ where: { id: toTableId } });
      if (!toTable) throw new Error(`Không tìm thấy bàn đích với ID ${toTableId}`);
      if (toTable.status !== 'AVAILABLE') throw new Error('Bàn đích không trống (đang sử dụng)');

      if (fromTable.orders && fromTable.orders.length > 0) {
        const activeOrder = fromTable.orders[0];
        await tx.order.update({
          where: { id: activeOrder.id },
          data: { table_id: toTableId },
        });
      }

      await tx.table.update({ where: { id: fromTableId }, data: { status: 'AVAILABLE' } });

      const updatedToTable = await tx.table.update({
        where: { id: toTableId },
        data: { status: 'OCCUPIED' },
        include: {
          orders: {
            where: { status: 'PENDING' },
            take: 1,
            orderBy: { created_at: 'desc' },
          },
        },
      });

      return updatedToTable;
    });

    return NextResponse.json({
      id: result.id,
      name: result.name,
      status: result.status,
      branch_id: result.branch_id,
      area: result.area,
      current_order: result.orders?.[0] ? {
        id: result.orders[0].id,
        order_number: result.orders[0].order_number,
        order_type: result.orders[0].order_type,
      } : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
