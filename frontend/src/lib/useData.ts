import useSWR, { mutate } from 'swr';
import { getBranches, getEmployees, getTables, getAvailableTables, getOrders, getMaterials, getToppings, getProducts, getCategories, createBranch, updateBranch, deleteBranch, createEmployee, updateEmployee, deleteEmployee, createTable, updateTable, deleteTable, createMaterial, updateMaterial, deleteMaterial, createOrder, addItemsToOrder, createProduct, updateProduct, deleteProduct, createTopping, updateTopping, deleteTopping } from './api';
import type { Branch, Employee, Table, Order, Material, Product as ProductType, Topping as ToppingType } from '@/types';

const API_URL = '/api';

export function useBranches() {
  const { data, error, isLoading, mutate: mutateBranches } = useSWR<Branch[]>(
    `${API_URL}/branches`,
    getBranches,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { branches: data || [], isLoading, error, mutate: mutateBranches };
}

export function useTables(branchId?: string) {
  const { data, error, isLoading, mutate: mutateTables } = useSWR<Table[]>(
    branchId ? `${API_URL}/tables?branch_id=${branchId}` : `${API_URL}/tables`,
    () => branchId ? getTables(branchId) : getTables(),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { tables: data || [], isLoading, error, mutate: mutateTables };
}

export function useAvailableTables(branchId?: string) {
  const { data, error, isLoading, mutate: mutateTables } = useSWR<Table[]>(
    branchId ? `${API_URL}/tables?branch_id=${branchId}&available=true` : `${API_URL}/tables?available=true`,
    () => branchId ? getAvailableTables(branchId) : getAvailableTables(),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { tables: data || [], isLoading, error, mutate: mutateTables };
}

export function useEmployees() {
  const { data, error, isLoading, mutate: mutateEmployees } = useSWR<Employee[]>(
    `${API_URL}/employees`,
    getEmployees,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { employees: data || [], isLoading, error, mutate: mutateEmployees };
}

export function useMaterials(branchId?: string) {
  const { data, error, isLoading, mutate: mutateMaterials } = useSWR<Material[]>(
    branchId ? `${API_URL}/materials?branch_id=${branchId}` : `${API_URL}/materials`,
    () => branchId ? getMaterials(branchId) : getMaterials(),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { materials: data || [], isLoading, error, mutate: mutateMaterials };
}

export function useOrders(params?: { branch_id?: string; page?: number; limit?: number; search?: string }) {
  const key = params ? `${API_URL}/orders?${new URLSearchParams(params as any).toString()}` : `${API_URL}/orders`;
  const { data, error, isLoading, mutate: mutateOrders } = useSWR<{ data: Order[]; total: number; page: number; limit: number }>(
    key,
    () => getOrders(params),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { orders: data?.data || [], total: data?.total || 0, page: data?.page || 1, limit: data?.limit || 20, isLoading, error, mutate: mutateOrders };
}

export async function refreshBranches() {
  await mutate(`${API_URL}/branches`, getBranches(), false);
}

export async function refreshTables(branchId?: string) {
  await Promise.all([
    mutate(branchId ? `${API_URL}/tables?branch_id=${branchId}` : `${API_URL}/tables`, getTables(branchId), false),
    mutate(branchId ? `${API_URL}/tables?branch_id=${branchId}&available=true` : `${API_URL}/tables?available=true`, getAvailableTables(branchId), false),
  ]);
}

export async function refreshEmployees() {
  await mutate(`${API_URL}/employees`, getEmployees(), false);
}

export async function refreshMaterials(branchId?: string) {
  await mutate(branchId ? `${API_URL}/materials?branch_id=${branchId}` : `${API_URL}/materials`, getMaterials(branchId), false);
}

export async function refreshOrders(params?: { branch_id?: string }) {
  await mutate(
    params?.branch_id ? `${API_URL}/orders?branch_id=${params.branch_id}` : `${API_URL}/orders`,
    () => getOrders(params),
    false
  );
}

export async function optimisticCreateBranch(data: any) {
  await createBranch(data);
  await refreshBranches();
}

export async function optimisticUpdateBranch(id: string, data: any) {
  await updateBranch(id, data);
  await refreshBranches();
}

export async function optimisticDeleteBranch(id: string) {
  await deleteBranch(id);
  await refreshBranches();
}

export async function optimisticCreateEmployee(data: any) {
  await createEmployee(data);
  await refreshEmployees();
}

export async function optimisticUpdateEmployee(id: string, data: any) {
  await updateEmployee(id, data);
  await refreshEmployees();
}

export async function optimisticDeleteEmployee(id: string) {
  await deleteEmployee(id);
  await refreshEmployees();
}

export async function optimisticCreateTable(data: { name: string; branch_id?: string }) {
  await createTable(data);
  await refreshTables(data.branch_id);
}

export async function optimisticUpdateTable(id: string, data: any) {
  await updateTable(id, data);
  await refreshTables();
}

export async function optimisticDeleteTable(id: string) {
  await deleteTable(id);
  await refreshTables();
}

export async function optimisticCreateMaterial(data: { name: string; unit: string; cost_per_unit: number; stock_current?: number }) {
  await createMaterial(data);
  await refreshMaterials();
}

export async function optimisticUpdateMaterial(id: string, data: any) {
  await updateMaterial(id, data);
  await refreshMaterials();
}

export async function optimisticDeleteMaterial(id: string) {
  await deleteMaterial(id);
  await refreshMaterials();
}