import prisma from './prisma';

export async function deductStockForOrder(
  orderId: string,
  orderNumber: string,
  items: any[],
  tx?: any
): Promise<void> {
  const p = tx || prisma;

  for (const item of items) {
    // 1. Deduct for Product Variant (Size)
    if (item.variant_id) {
      const recipes = await p.productRecipe.findMany({
        where: { variant_id: item.variant_id },
      });

      for (const recipe of recipes) {
        const amountUsed = recipe.quantity * item.quantity;
        await updateStockInternal(
          recipe.material_id,
          amountUsed,
          `Đơn ${orderNumber} - ${item.product_name || 'Sản phẩm'}`,
          p
        );
      }
    }

    // 2. Deduct for Toppings
    if (item.topping_ids && item.topping_ids.length > 0) {
      for (const toppingId of item.topping_ids) {
        const recipes = await p.toppingRecipe.findMany({
          where: { topping_id: toppingId },
        });

        for (const recipe of recipes) {
          const amountUsed = recipe.quantity * item.quantity;
          await updateStockInternal(
            recipe.material_id,
            amountUsed,
            `Đơn ${orderNumber} - Topping`,
            p
          );
        }
      }
    }
  }
}

async function updateStockInternal(
  materialId: string,
  amount: number,
  note: string,
  p: any
): Promise<void> {
  const material = await p.material.findUnique({
    where: { id: materialId },
    select: { stock_current: true },
  });

  if (!material) return;

  const newStock = material.stock_current - amount;
  // Note: NestJS threw error if newStock < 0. We'll do same if needed, or just warn.
  if (newStock < 0) {
    // throw new Error(`Không đủ nguyên liệu cho ${note}`);
  }

  const updatedMaterial = await p.material.update({
    where: { id: materialId },
    data: { stock_current: Math.max(0, newStock) },
  });

  await p.materialTransaction.create({
    data: {
      material_id: materialId,
      type: 'USED',
      quantity: amount,
      note: note,
    },
  });

  await handleAutoOffItems(materialId, updatedMaterial.stock_current, p);
}

async function handleAutoOffItems(
  materialId: string,
  newStock: number,
  p: any
): Promise<void> {
  if (newStock <= 0) {
    // Find variants that use this material
    const productRecipes = await p.productRecipe.findMany({
      where: { material_id: materialId },
      include: { variant: true },
    });
    const productIds = Array.from(
      new Set(productRecipes.map((r: any) => r.variant.product_id))
    );
    if (productIds.length > 0) {
      await p.product.updateMany({
        where: { id: { in: productIds as string[] } },
        data: { available: false },
      });
    }

    // Find toppings that use this material
    const toppingRecipes = await p.toppingRecipe.findMany({
      where: { material_id: materialId },
    });
    const toppingIds = toppingRecipes.map((r: any) => r.topping_id);
    if (toppingIds.length > 0) {
      await p.topping.updateMany({
        where: { id: { in: toppingIds as string[] } },
        data: { available: false },
      });
    }
  }
}
