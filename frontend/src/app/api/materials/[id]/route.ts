import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const dto = await request.json();
    const material = await prisma.material.update({
      where: { id: (await params).id },
      data: {
        name: dto.name,
        unit: dto.unit,
        cost_per_unit: dto.cost_per_unit,
        stock_current: dto.stock_current,
        safety_stock: dto.safety_stock,
        branch_id: dto.branch_id,
      },
    });
    return NextResponse.json(material);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.material.delete({ where: { id: (await params).id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
