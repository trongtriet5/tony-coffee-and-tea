import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // For getProductRecipes, the frontend passes productId. 
    // Wait, if it passes productId, we need to find recipes for all variants of that product!
    const variants = await prisma.productVariant.findMany({
      where: { product_id: id },
      select: { id: true }
    });
    
    if (variants.length === 0) {
      return NextResponse.json([]);
    }

    const variantIds = variants.map(v => v.id);

    const recipes = await prisma.productRecipe.findMany({
      where: { variant_id: { in: variantIds } },
      include: { material: true, variant: true }
    });
    return NextResponse.json(recipes);
  } catch (error: any) {
    console.error('Error fetching product recipes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.productRecipe.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const recipe = await prisma.productRecipe.update({
      where: { id },
      data: { quantity: data.quantity }
    });
    return NextResponse.json(recipe);
  } catch (error: any) {
    console.error('Error updating product recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
