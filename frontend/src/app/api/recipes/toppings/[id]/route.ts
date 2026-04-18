import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const recipes = await prisma.toppingRecipe.findMany({
      where: { topping_id: id },
      include: { material: true }
    });
    return NextResponse.json(recipes);
  } catch (error: any) {
    console.error('Error fetching topping recipes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.toppingRecipe.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting topping recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const recipe = await prisma.toppingRecipe.update({
      where: { id },
      data: { quantity: data.quantity }
    });
    return NextResponse.json(recipe);
  } catch (error: any) {
    console.error('Error updating topping recipe:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
