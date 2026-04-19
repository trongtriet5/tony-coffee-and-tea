import prisma from './prisma';

export async function deductStockForOrder(
  orderId: string,
  orderNumber: string,
  items: any[]
): Promise<void> {
  // Always use prisma directly - NOT inside a transaction to avoid transaction errors
  for (const item of items) {
    // 1. Deduct for Product Variant (Size)
    if (item.variant_id) {
      const recipes = await prisma.productRecipe.findMany({
        where: { variant_id: item.variant_id },
      });

      for (const recipe of recipes) {
        const amountUsed = recipe.quantity * item.quantity;
        await updateStockInternal(
          recipe.material_id,
          amountUsed,
          `Đơn ${orderNumber} - ${item.product_name || 'Sản phẩm'}`
        );
      }
    }

    // 2. Deduct for Toppings
    if (item.topping_ids && item.topping_ids.length > 0) {
      for (const toppingId of item.topping_ids) {
        const recipes = await prisma.toppingRecipe.findMany({
          where: { topping_id: toppingId },
        });

        for (const recipe of recipes) {
          const amountUsed = recipe.quantity * item.quantity;
          await updateStockInternal(
            recipe.material_id,
            amountUsed,
            `Đơn ${orderNumber} - Topping`
          );
        }
      }
    }
  }
}

async function updateStockInternal(
  materialId: string,
  amount: number,
  note: string
): Promise<void> {
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    select: { stock_current: true },
  });

  if (!material) return;

  const newStock = material.stock_current - amount;
  if (newStock < 0) {
    // Don't throw, just warn
    return;
  }

  const updatedMaterial = await prisma.material.update({
    where: { id: materialId },
    data: { stock_current: Math.max(0, newStock) },
  });

  await prisma.materialTransaction.create({
    data: {
      material_id: materialId,
      type: 'USED',
      quantity: amount,
      note: note,
    },
  });

  await handleAutoOffItems(materialId, updatedMaterial.stock_current);
}

async function handleAutoOffItems(
  materialId: string,
  newStock: number
): Promise<void> {
  if (newStock <= 0) {
    // Find variants that use this material
    const productRecipes = await prisma.productRecipe.findMany({
      where: { material_id: materialId },
      include: { variant: true },
    });
    const productIds = Array.from(
      new Set(productRecipes.map((r: any) => r.variant.product_id))
    );
    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: productIds as string[] } },
        data: { available: false },
      });
    }

    // Find toppings that use this material
    const toppingRecipes = await prisma.toppingRecipe.findMany({
      where: { material_id: materialId },
    });
    const toppingIds = toppingRecipes.map((r: any) => r.topping_id);
    if (toppingIds.length > 0) {
      await prisma.topping.updateMany({
        where: { id: { in: toppingIds as string[] } },
        data: { available: false },
      });
    }
  }
}
