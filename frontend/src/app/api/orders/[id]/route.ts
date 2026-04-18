import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';
import { deductStockForOrder } from '@/lib/material-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            toppings: true,
          },
        },
        branch: true,
        table: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order không tồn tại' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const dto = await request.json();
    const items = dto.items || [];

    const productIds = items.map((i: any) => i.product_id);
    const variantIds = items.filter((i: any) => i.variant_id).map((i: any) => i.variant_id);
    const allToppingIds = items.flatMap((i: any) => i.topping_ids || []);

    const [products, variants, toppings] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: productIds } } }),
      prisma.productVariant.findMany({ where: { id: { in: variantIds } } }),
      prisma.topping.findMany({ where: { id: { in: allToppingIds } } }),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const toppingMap = new Map(toppings.map((t) => [t.id, t]));

    const itemsData = items.map((item: any) => {
      const prod = productMap.get(item.product_id);
      if (!prod) throw new Error(`Sản phẩm không tồn tại`);

      let unitPrice = 0;
      if (item.variant_id) {
        const variant = variantMap.get(item.variant_id);
        if (!variant) throw new Error(`Size không hợp lệ`);
        unitPrice = variant.price;
      }

      let itemSubtotal = unitPrice * item.quantity;
      const selectedToppings = (item.topping_ids || []).map((tid: any) => {
        const t = toppingMap.get(tid);
        if (!t) throw new Error(`Topping không tồn tại`);
        itemSubtotal += t.price * item.quantity;
        return { topping_id: t.id, name: t.name, price: t.price };
      });

      return {
        product_id: prod.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: itemSubtotal,
        toppings: { create: selectedToppings },
      };
    });

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ message: 'Order không tồn tại' }, { status: 404 });

    const totalAmountVal = itemsData.reduce((sum: number, item: any) => sum + item.subtotal, 0);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        items: { create: itemsData },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            toppings: true,
          },
        },
        branch: true,
        table: true,
      },
    });

    const enrichedItems = items.map((item: any) => ({
      ...item,
      product_name: productMap.get(item.product_id)?.name_vi || 'Sản phẩm',
    }));
    await deductStockForOrder(id, order.order_number, enrichedItems, prisma);

    return NextResponse.json({ ...updatedOrder, new_items_total: totalAmountVal });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
