import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get('branch_id');

  const where: any = {};
  if (branch_id) where.branch_id = branch_id;

  const materials = await prisma.material.findMany({
    where,
    orderBy: { name: 'asc' },
  });
  
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const dto = await request.json();
    const material = await prisma.material.create({
      data: {
        name: dto.name,
        unit: dto.unit,
        cost_per_unit: dto.cost_per_unit,
        stock_current: dto.stock_current || 0,
        safety_stock: dto.safety_stock,
        branch_id: dto.branch_id,
      },
    });
    return NextResponse.json(material);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
