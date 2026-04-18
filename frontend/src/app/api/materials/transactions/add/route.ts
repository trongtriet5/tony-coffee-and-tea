import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const dto = await request.json();
    const { material_id, type, quantity, note } = dto;
    if (!material_id || !type || quantity === undefined) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const material = await prisma.material.findUnique({ where: { id: material_id } });
    if (!material) return NextResponse.json({ message: 'Material not found' }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.materialTransaction.create({
        data: { material_id, type, quantity, note },
      });

      let newStock = material.stock_current;
      if (type === 'IN') newStock += Math.abs(quantity);
      else if (type === 'OUT' || type === 'USED') newStock -= Math.abs(quantity);
      else if (type === 'ADJUST') newStock += quantity; 

      await tx.material.update({
        where: { id: material_id },
        data: { stock_current: newStock },
      });

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
