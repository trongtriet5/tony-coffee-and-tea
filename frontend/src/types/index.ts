export type OrderType = 'TAKEAWAY' | 'DINE_IN';
export type MaterialTransactionType = 'IN' | 'OUT' | 'ADJUST' | 'USED';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'E_WALLET';


export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name_vi: string;
  name_en: string;
  category: string;
  available: boolean;
  variants: ProductVariant[];
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface Employee {
  id: string;
  name: string;
  position_name: string;
  role: 'STAFF' | 'ADMIN' | 'MANAGER';
  branch_id: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  variant_id?: string;
  quantity: number;
  selectedToppings?: Topping[];
  note?: string;
  isExisting?: boolean;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product?: Product;
  variant_id?: string;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  subtotal: number;
  toppings?: { name: string; price: number }[];
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  order_type: OrderType;
  table_id?: string;
  branch_id: string;
  print_count: number;
  created_at: string;
  items: OrderItem[];
}

export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_discount: number;
  total_net_revenue: number;
  revenue_by_day: Array<{ date: string; revenue: number }>;
  top_products: Array<{ name: string; count: number }>;
  transaction_count_by_hour: Array<{ hour: string; products: number; toppings: number }>;
  comparison?: {
    prev_total_orders: number;
    prev_total_net_revenue: number;
    orders_change_percent: number;
    revenue_change_percent: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== Material & Inventory ==============
export interface Material {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  stock_current: number;
  safety_stock?: number;
  stock_value: number;
  created_at: Date;
}

export interface MaterialTransaction {
  id: string;
  material_id: string;
  type: MaterialTransactionType;
  quantity: number;
  note?: string;
  created_at: Date;
}

export interface Recipe {
  id: string;
  variant_id?: string;
  topping_id?: string;
  material_id: string;
  quantity: number;
}

// ============== Table Management ==============
export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  branch_id: string;
  area?: string;
  orders?: {
    id: string;
    order_number: string;
    order_type: OrderType;
    final_amount: number;
    created_at: string;
    items?: {
      id: string;
      quantity: number;
      subtotal: number;
      product?: {
        id: string;
        name_vi?: string;
      };
      toppings?: any[];
    }[];
  }[];
}
