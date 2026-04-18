import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-headers';
import { format, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get('branch_id');
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const startDate = startDateParam ? new Date(startDateParam) : startOfDay(new Date());
  const endDate = endDateParam ? new Date(endDateParam) : endOfDay(new Date());

  const where: any = {
    status: 'COMPLETED',
    created_at: {
      gte: startDate,
      lte: endDate,
    },
  };
  if (branch_id) where.branch_id = branch_id;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          product: true,
          toppings: true
        }
      }
    }
  });

  let total_orders = 0;
  let total_revenue = 0;
  let total_discount = 0;
  let total_net_revenue = 0;

  const revenueByDayMap = new Map<string, number>();
  const productCountMap = new Map<string, number>();
  const hourMap = new Map<string, { products: number; toppings: number }>();

  // Initialize hour map (00 to 23)
  for (let i = 0; i < 24; i++) {
    hourMap.set(i.toString().padStart(2, '0'), { products: 0, toppings: 0 });
  }

  for (const order of orders) {
    total_orders++;
    total_revenue += order.total_amount;
    total_discount += order.discount_amount;
    total_net_revenue += order.final_amount;

    const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd');
    revenueByDayMap.set(dateStr, (revenueByDayMap.get(dateStr) || 0) + order.final_amount);

    const hourStr = format(new Date(order.created_at), 'HH');
    const hStats = hourMap.get(hourStr) || { products: 0, toppings: 0 };
    
    for (const item of order.items) {
      // Accumulate product quantity
      const pName = item.product?.name_vi || 'Unknown';
      productCountMap.set(pName, (productCountMap.get(pName) || 0) + item.quantity);
      hStats.products += item.quantity;
      
      // Accumulate toppings quantity
      if (item.toppings) {
        hStats.toppings += item.toppings.length * item.quantity;
      }
    }
    hourMap.set(hourStr, hStats);
  }

  const revenue_by_day = Array.from(revenueByDayMap.entries()).map(([date, revenue]) => ({ date, revenue }));
  revenue_by_day.sort((a, b) => a.date.localeCompare(b.date));

  const top_products = Array.from(productCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const transaction_count_by_hour = Array.from(hourMap.entries())
    .map(([hour, stats]) => ({ hour: `${hour}:00`, products: stats.products, toppings: stats.toppings }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Compute previous period comparison
  const durationInMs = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationInMs);

  const prevWhere: any = {
    status: 'COMPLETED',
    created_at: {
      gte: prevStartDate,
      lte: prevEndDate,
    },
  };
  if (branch_id) prevWhere.branch_id = branch_id;
  
  const prevOrders = await prisma.order.findMany({ where: prevWhere });
  
  let prev_total_orders = prevOrders.length;
  let prev_total_net_revenue = prevOrders.reduce((sum, o) => sum + o.final_amount, 0);

  const orders_change_percent = prev_total_orders > 0 
    ? ((total_orders - prev_total_orders) / prev_total_orders) * 100 
    : (total_orders > 0 ? 100 : 0);

  const revenue_change_percent = prev_total_net_revenue > 0 
    ? ((total_net_revenue - prev_total_net_revenue) / prev_total_net_revenue) * 100 
    : (total_net_revenue > 0 ? 100 : 0);

  const comparison = {
    prev_total_orders,
    prev_total_net_revenue,
    orders_change_percent,
    revenue_change_percent,
  };

  return NextResponse.json({
    total_orders,
    total_revenue,
    total_discount,
    total_net_revenue,
    revenue_by_day,
    top_products,
    transaction_count_by_hour,
    comparison
  });
}
