import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check if recipe for this variant and material already exists
    const existing = await prisma.productRecipe.findUnique({
      where: {
        variant_id_material_id: {
          variant_id: data.variant_id,
          material_id: data.material_id
        }
      }
    });

    if (existing) {
      // Just update quantity
      const recipe = await prisma.productRecipe.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity }
      });
      return NextResponse.json(recipe);
    }

    const recipe = await prisma.productRecipe.create({
      data: {
        variant_id: data.variant_id,
        material_id: data.material_id,
        quantity: data.quantity
      }
    });
    return NextResponse.json(recipe);
  } catch (error: any) {
    console.error('Error creating product recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
