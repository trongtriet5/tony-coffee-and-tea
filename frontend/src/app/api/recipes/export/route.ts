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
      ['Tên sản phẩm', 'Size', 'Tên nguyên liệu', 'Định lượng'],
      ['Cà phê sữa đá', 'M', 'Sữa tươi không đường', '150'],
      ['Cà phê sữa đá', 'M', 'Cà phê rang xay', '30'],
    ];
    return NextResponse.json(template);
  }

  return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
}