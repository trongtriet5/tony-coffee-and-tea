import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';
import { v4 as uuidv4 } from 'uuid';
import { deductStockForOrder } from '@/lib/material-utils';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get('branch_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  const skip = (page - 1) * limit;
  const where: any = {};
  if (branch_id) where.branch_id = branch_id;
  if (status) where.status = status;
  if (search) {
    where.order_number = { contains: search, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        items: { 
          include: { 
            product: { select: { id: true, name_vi: true, name_en: true } },
            variant: { select: { id: true, size: true, price: true } },
            toppings: { select: { id: true, name: true, price: true } }
          } 
        },
        branch: { select: { id: true, name: true } },
        table: { select: { id: true, name: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const dto = await request.json();
    const orderType = dto.order_type || 'TAKEAWAY';
    const source = dto.source || 'POS';

    let tableId: string | null = null;
    if (orderType === 'DINE_IN') {
      if (!dto.table_id) return NextResponse.json({ message: 'Table ID is required for dine-in orders' }, { status: 400 });
      const table = await prisma.table.findUnique({ where: { id: dto.table_id } });
      if (!table) return NextResponse.json({ message: 'Table not found' }, { status: 400 });
      // Allow creating new order even if table is OCCUPIED (for adding more items to existing table)
      tableId = dto.table_id;
    }

    const productIds = dto.items.map((i: any) => i.product_id);
    const variantIds = dto.items.filter((i: any) => i.variant_id).map((i: any) => i.variant_id);
    const allToppingIds = dto.items.flatMap((i: any) => i.topping_ids || []);

    const [products, variants, toppings] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: productIds }, available: true } }),
      prisma.productVariant.findMany({ where: { id: { in: variantIds } } }),
      prisma.topping.findMany({ where: { id: { in: allToppingIds }, available: true } }),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const toppingMap = new Map(toppings.map((t) => [t.id, t]));

    let totalAmountVal = 0;
    const itemsData = dto.items.map((item: any) => {
      const prod = productMap.get(item.product_id);
      if (!prod) throw new Error(`Sản phẩm ${item.product_id} không tồn tại`);

      let unitPrice = 0;
      if (item.variant_id) {
        const variant = variantMap.get(item.variant_id);
        if (!variant) throw new Error(`Size không hợp lệ cho sản phẩm ${prod.name_vi}`);
        unitPrice = variant.price;
      } else {
        throw new Error(`Vui lòng chọn size cho sản phẩm ${prod.name_vi}`);
      }

      let itemSubtotal = unitPrice * item.quantity;
      const selectedToppings = (item.topping_ids || []).map((tid: any) => {
        const t = toppingMap.get(tid);
        if (!t) throw new Error(`Topping ${tid} không tồn tại`);
        itemSubtotal += t.price * item.quantity;
        return { topping_id: t.id, name: t.name, price: t.price };
      });

      totalAmountVal += itemSubtotal;
      return {
        product_id: prod.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: itemSubtotal,
        note: item.note || null,
        toppings: { create: selectedToppings },
      };
    });

    const discountAmountVal = dto.discount_amount || 0;
    const finalAmountVal = Math.max(0, totalAmountVal - discountAmountVal);

    const todayStr = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date());
    const ddmm = todayStr.substring(0, 2) + todayStr.substring(3, 5);

    // Create order first
    const order = await prisma.order.create({
      data: {
        order_number: `TONY-${ddmm}-${uuidv4().split('-')[0].toUpperCase()}`,
        total_amount: totalAmountVal,
        discount_amount: discountAmountVal,
        final_amount: finalAmountVal,
        payment_method: dto.payment_method,
        status: 'COMPLETED',
        order_type: orderType,
        source: source,
        branch_id: dto.branch_id,
        table_id: tableId,
        items: { create: itemsData },
      },
      include: { items: { include: { product: true, variant: true, toppings: true } }, table: true },
    });

    // Update table status if dine-in
    if (tableId) {
      const existingTable = await prisma.table.findUnique({ where: { id: tableId } });
      if (existingTable && existingTable.status !== 'OCCUPIED') {
        await prisma.table.update({ where: { id: tableId }, data: { status: 'OCCUPIED' } });
      }
    }

    // Deduct stock AFTER order is created (outside transaction)
    const enrichedItems = dto.items.map((item: any) => ({
      ...item,
      product_name: productMap.get(item.product_id)?.name_vi || 'Sản phẩm',
    }));
    await deductStockForOrder(order.id, order.order_number, enrichedItems);

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
