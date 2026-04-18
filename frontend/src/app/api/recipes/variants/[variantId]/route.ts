import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ variantId: string }> }) {
  try {
    const { variantId } = await params;
    const recipes = await prisma.productRecipe.findMany({
      where: { variant_id: variantId },
      include: { material: true }
    });
    return NextResponse.json(recipes);
  } catch (error: any) {
    console.error('Error fetching recipes by variant:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
