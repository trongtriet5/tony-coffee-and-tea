import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'template') {
    const template = [
      ['Tên nguyên liệu', 'Đơn vị tính', 'Giá mỗi ĐVT', 'Tồn kho hiện tại', 'Tồn kho an toàn'],
      ['Sữa tươi không đường', 'Lít', '35000', '10', '2'],
      ['Cà phê rang xay', 'Kg', '150000', '5', '1'],
    ];
    return NextResponse.json(template);
  }

  return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
}