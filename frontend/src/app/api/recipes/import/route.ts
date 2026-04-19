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

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString('binary');
    
    const lines = content.split('\n').filter((line: string) => line.trim());
    if (lines.length < 2) {
      return NextResponse.json({ message: 'File rỗng hoặc không có dữ liệu' }, { status: 400 });
    }

    const success: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim());
      if (values.length < 3 || !values[0]) continue;

      try {
        const productName = values[0];
        const variantSize = values[1];
        const materialName = values[2];
        const quantity = parseFloat(values[3]) || 0;

        const product = await prisma.product.findFirst({ where: { name_vi: productName } });
        if (!product) {
          errors.push(`Dòng ${i + 1}: Không tìm thấy sản phẩm "${productName}"`);
          continue;
        }

        const variant = await prisma.productVariant.findFirst({
          where: { product_id: product.id, size: variantSize },
        });
        if (!variant) {
          errors.push(`Dòng ${i + 1}: Không tìm thấy size "${variantSize}" của sản phẩm "${productName}"`);
          continue;
        }

        const material = await prisma.material.findFirst({ where: { name: materialName } });
        if (!material) {
          errors.push(`Dòng ${i + 1}: Không tìm thấy nguyên liệu "${materialName}"`);
          continue;
        }

        await prisma.productRecipe.upsert({
          where: {
            variant_id_material_id: {
              variant_id: variant.id,
              material_id: material.id,
            },
          },
          update: { quantity },
          create: {
            variant_id: variant.id,
            material_id: material.id,
            quantity,
          },
        });
        success.push(`${productName} (${variantSize}) + ${materialName}`);
      } catch (e: any) {
        errors.push(`Dòng ${i + 1}: ${e.message}`);
      }
    }

    return NextResponse.json({ success: success.length, total: lines.length - 1, errors, names: success });
  } catch (error: any) {
    console.error('Import recipe error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}