import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Check if recipe already exists
    const existing = await prisma.toppingRecipe.findUnique({
      where: {
        topping_id_material_id: {
          topping_id: data.topping_id,
          material_id: data.material_id
        }
      }
    });

    if (existing) {
      const recipe = await prisma.toppingRecipe.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity }
      });
      return NextResponse.json(recipe);
    }

    const recipe = await prisma.toppingRecipe.create({
      data: {
        topping_id: data.topping_id,
        material_id: data.material_id,
        quantity: data.quantity
      }
    });
    return NextResponse.json(recipe);
  } catch (error: any) {
    console.error('Error creating topping recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
