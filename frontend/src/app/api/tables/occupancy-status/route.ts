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

  const [total, occupied] = await Promise.all([
    prisma.table.count({ where }),
    prisma.table.count({ where: { ...where, status: 'OCCUPIED' } }),
  ]);

  const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;

  return NextResponse.json({
    total_tables: total,
    occupied_tables: occupied,
    available_tables: total - occupied,
    occupancy_rate: occupancyRate > 0 ? occupancyRate.toFixed(1) + '%' : '0%',
  });
}
