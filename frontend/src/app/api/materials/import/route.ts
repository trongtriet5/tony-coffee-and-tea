import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const branchId = formData.get('branch_id') as string || null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString('binary');
    
    const lines = content.split('\n').filter((line: string) => line.trim());
    if (lines.length < 2) {
      return NextResponse.json({ message: 'File rỗng hoặc không có dữ liệu' }, { status: 400 });
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    const success: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim());
      if (values.length < 2 || !values[0]) continue;

      try {
        const name = values[0];
        const unit = values[1] || 'Đơn vị';
        const cost_per_unit = parseFloat(values[2]) || 0;
        const stock_current = parseFloat(values[3]) || 0;
        const safety_stock = parseFloat(values[4]) || null;

        await prisma.material.create({
          data: {
            name,
            unit,
            cost_per_unit,
            stock_current,
            safety_stock,
            branch_id: branchId || null,
          },
        });
        success.push(name);
      } catch (e: any) {
        errors.push(`Dòng ${i + 1}: ${e.message}`);
      }
    }

    return NextResponse.json({ success: success.length, total: lines.length - 1, errors, names: success });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}