import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branch_id');

  const where: any = {};
  if (branchId) where.branch_id = branchId;

  const materials = await prisma.material.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  const data = materials.map(m => [
    m.name,
    m.unit,
    m.cost_per_unit,
    m.stock_current,
    m.safety_stock,
  ]);

  const headers = ['Tên nguyên liệu', 'Đơn vị tính', 'Giá mỗi ĐVT', 'Tồn kho hiện tại', 'Tồn kho an toàn'];
  
  return NextResponse.json([headers, ...data]);
}