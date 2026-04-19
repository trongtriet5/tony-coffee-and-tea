import axios from 'axios';
import type {
  Product, Topping, Order, DashboardStats,
  PaginatedResponse, PaymentMethod, OrderType, TableStatus, Table
} from '@/types';

const BASE_URL = '/api';

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

// Add interceptor to attach token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Add interceptor to handle 401 Unauthorized
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export const login = (username: string, password: string): Promise<any> =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

// ============== Products & Toppings ==============
export const getProducts = (params?: { all?: boolean }): Promise<Product[]> => api.get('/products', { params }).then((r) => r.data);
export const createProduct = (data: Omit<Product, 'id'>): Promise<Product> => api.post('/products', data).then((r) => r.data);
export const updateProduct = (id: string, data: Partial<Product>): Promise<Product> => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id: string): Promise<void> => api.delete(`/products/${id}`).then((r) => r.data);
export const getCategories = (): Promise<{ category: string; count: number }[]> => api.get('/products/categories').then((r) => r.data);
export const getToppings = (params?: { all?: boolean }): Promise<Topping[]> => api.get('/products/toppings', { params }).then((r) => r.data);
export const createTopping = (data: Omit<Topping, 'id'>): Promise<Topping> => api.post('/products/toppings', data).then((r) => r.data);
export const updateTopping = (id: string, data: Partial<Topping>): Promise<Topping> => api.put(`/products/toppings/${id}`, data).then((r) => r.data);
export const deleteTopping = (id: string): Promise<void> => api.delete(`/products/toppings/${id}`).then((r) => r.data);


// ============== Orders ==============
export interface CreateOrderPayload {
  branch_id: string;
  items: { product_id: string; variant_id?: string; quantity: number; topping_ids?: string[]; note?: string }[];
  payment_method: string;
  order_type?: 'TAKEAWAY' | 'DINE_IN';
  table_id?: string;
}

export const createOrder = (data: CreateOrderPayload): Promise<Order> => api.post('/orders', data).then((r) => r.data);
export const getOrders = (params?: { branch_id?: string; page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Order>> => api.get('/orders', { params }).then((r) => r.data);
export const getOrder = (id: string): Promise<Order> => api.get(`/orders/${id}`).then((r) => r.data);
let branchesCache: { data: any[]; timestamp: number } | null = null;
const BRANCH_CACHE_TTL = 60000;
export const getBranches = async (): Promise<any[]> => {
  if (branchesCache && Date.now() - branchesCache.timestamp < BRANCH_CACHE_TTL) return branchesCache.data;
  const res = await api.get('/branches');
  branchesCache = { data: res.data, timestamp: Date.now() };
  return res.data;
};
export const createBranch = (data: any): Promise<any> => {
  branchesCache = null; 
  return api.post('/branches', data).then((r) => r.data);
};
export const updateBranch = (id: string, data: any): Promise<any> => {
  branchesCache = null;
  return api.patch(`/branches/${id}`, data).then((r) => r.data);
};
export const deleteBranch = (id: string): Promise<any> => {
  branchesCache = null;
  return api.delete(`/branches/${id}`).then((r) => r.data);
};

export const getEmployees = (): Promise<any[]> => api.get('/employees').then((r) => r.data);
export const createEmployee = (data: any): Promise<any> => api.post('/employees', data).then((r) => r.data);
export const updateEmployee = (id: string, data: any): Promise<any> => api.patch(`/employees/${id}`, data).then((r) => r.data);
export const deleteEmployee = (id: string): Promise<any> => api.delete(`/employees/${id}`).then((r) => r.data);

export const addItemsToOrder = (id: string, items: any[], paymentMethod?: string): Promise<Order> => api.post(`/orders/${id}`, { items, payment_method: paymentMethod }).then((r) => r.data);
export const getDashboardStats = (params?: { branch_id?: string; startDate?: string; endDate?: string }): Promise<DashboardStats> => api.get('/orders/dashboard', { params }).then((r) => r.data);
export const reprintOrder = (id: string): Promise<Order> => api.post(`/orders/${id}/reprint`).then((r) => r.data);

// ============== Materials & Inventory ==============
export interface Material {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  stock_current: number;
  stock_value: number;
  created_at: Date;
}

export interface MaterialTransaction {
  id: string;
  material_id: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'USED';
  quantity: number;
  note?: string;
  created_at: Date;
}

export const getMaterials = (branchId?: string): Promise<Material[]> => api.get('/materials', { params: { branch_id: branchId } }).then((r) => r.data);
export const createMaterial = (data: { name: string; unit: string; cost_per_unit: number; stock_current?: number }): Promise<Material> => api.post('/materials', data).then((r) => r.data);
export const updateMaterial = (id: string, data: Partial<Material>): Promise<Material> => api.put(`/materials/${id}`, data).then((r) => r.data);
export const deleteMaterial = (id: string): Promise<void> => api.delete(`/materials/${id}`).then((r) => r.data);
export const addMaterialTransaction = (data: { material_id: string; type: 'IN' | 'OUT' | 'ADJUST' | 'USED'; quantity: number; note?: string }): Promise<any> => api.post('/materials/transactions/add', data).then((r) => r.data);
export const getMaterialTransactions = (id: string, limit?: number): Promise<MaterialTransaction[]> => api.get(`/materials/${id}/transactions`, { params: { limit } }).then((r) => r.data);
export const getAllTransactions = (branchId?: string, limit: number = 100): Promise<MaterialTransaction[]> => api.get('/materials/transactions/all', { params: { branch_id: branchId, limit } }).then((r) => r.data);
export const getInventoryReport = (params?: { startDate?: string; endDate?: string }): Promise<any> => api.get('/materials/reports/inventory', { params }).then((r) => r.data);
export const exportMaterialsExcel = (branchId?: string): string => `${BASE_URL}/materials/export/excel${branchId ? `?branch_id=${branchId}` : ''}`;
export const getMaterialTemplateUrl = (): string => `${BASE_URL}/materials/export?type=template`;
export const importMaterials = (file: File, branchId?: string): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/materials/import${branchId ? `?branch_id=${branchId}` : ''}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};

// ============== Recipes (BOM) ==============
export interface Recipe {
  id: string;
  product_id?: string;
  topping_id?: string;
  material_id: string;
  quantity: number;
}

export const createProductRecipe = (data: { variant_id: string; material_id: string; quantity: number }): Promise<any> => api.post('/recipes/products', data).then((r) => r.data);
export const getProductRecipes = (productId: string): Promise<any[]> => api.get(`/recipes/products/${productId}`).then((r) => r.data);
export const getRecipesByVariant = (variantId: string): Promise<any[]> => api.get(`/recipes/variants/${variantId}`).then((r) => r.data);
export const getCompleteProductRecipe = (productId: string): Promise<any> => api.get(`/recipes/products/${productId}/complete`).then((r) => r.data);
export const updateProductRecipe = (id: string, quantity: number): Promise<any> => api.put(`/recipes/products/${id}`, { quantity }).then((r) => r.data);
export const deleteProductRecipe = (id: string): Promise<void> => api.delete(`/recipes/products/${id}`).then((r) => r.data);
export const createToppingRecipe = (data: { topping_id: string; material_id: string; quantity: number }): Promise<any> => api.post('/recipes/toppings', data).then((r) => r.data);
export const getToppingRecipes = (toppingId: string): Promise<any[]> => api.get(`/recipes/toppings/${toppingId}`).then((r) => r.data);
export const updateToppingRecipe = (id: string, quantity: number): Promise<any> => api.put(`/recipes/toppings/${id}`, { quantity }).then((r) => r.data);
export const deleteToppingRecipe = (id: string): Promise<void> => api.delete(`/recipes/toppings/${id}`).then((r) => r.data);

export const exportRecipesExcel = (): string => `${BASE_URL}/recipes/export/excel`;
export const getRecipeTemplateUrl = (): string => `${BASE_URL}/recipes/export?type=template`;
export const importRecipes = (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/recipes/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};

// (Table interface is now imported from types/index.ts)

export const getTables = (branchId?: string): Promise<Table[]> => api.get('/tables', { params: { branch_id: branchId } }).then((r) => r.data);
export const getAvailableTables = (branchId?: string): Promise<Table[]> => api.get('/tables', { params: { branch_id: branchId, available: 'true' } }).then((r) => r.data);
export const createTable = (data: { name: string; branch_id?: string }): Promise<Table> => api.post('/tables', data).then((r) => r.data);
export const updateTable = (id: string, data: Partial<Table>): Promise<Table> => api.put(`/tables/${id}`, data).then((r) => r.data);
export const deleteTable = (id: string): Promise<void> => api.delete(`/tables/${id}`).then((r) => r.data);
export const occupyTable = (id: string): Promise<Table> => api.post(`/tables/${id}/occupy`, {}).then((r) => r.data);
export const releaseTable = (id: string): Promise<Table> => api.post(`/tables/${id}/release`, {}).then((r) => r.data);
export const transferTable = (id: string, toTableId: string): Promise<Table> => api.post(`/tables/${id}/transfer`, { to_table_id: toTableId }).then((r) => r.data);
export const getTableOccupancy = (branchId?: string): Promise<any> => api.get('/tables/occupancy-status', { params: { branch_id: branchId } }).then((r) => r.data);

export default api;

