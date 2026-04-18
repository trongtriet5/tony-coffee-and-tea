import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const branch = await prisma.branch.findUnique({
    where: { id },
  });

  if (!branch) return NextResponse.json({ message: 'Branch not found' }, { status: 404 });
  return NextResponse.json(branch);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const branch = await prisma.branch.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(branch);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const branch = await prisma.branch.findUnique({
      where: { id },
    });
    if (!branch) return NextResponse.json({ message: 'Branch not found' }, { status: 404 });

    const [orderCount, employeeCount, tableCount, materialCount] = await Promise.all([
      prisma.order.count({ where: { branch_id: id } }),
      prisma.employee.count({ where: { branch_id: id } }),
      prisma.table.count({ where: { branch_id: id } }),
      prisma.material.count({ where: { branch_id: id } }),
    ]);

    const relatedRecords: string[] = [];
    if (orderCount > 0) relatedRecords.push(`${orderCount} đơn hàng`);
    if (employeeCount > 0) relatedRecords.push(`${employeeCount} nhân viên`);
    if (tableCount > 0) relatedRecords.push(`${tableCount} bàn`);
    if (materialCount > 0) relatedRecords.push(`${materialCount} nguyên vật liệu`);

    if (relatedRecords.length > 0) {
      return NextResponse.json(
        { message: `Không thể xóa chi nhánh "${branch.name}". Chi nhánh có: ${relatedRecords.join(', ')}. Vui lòng xóa các bản ghi liên quan trước.` },
        { status: 400 }
      );
    }

    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
