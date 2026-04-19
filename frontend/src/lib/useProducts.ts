import useSWR, { mutate } from 'swr';
import { getProducts, getCategories, getToppings, createProduct, updateProduct, deleteProduct, createTopping, updateTopping, deleteTopping } from './api';
import type { Product, Topping } from '@/types';

const API_URL = '/api';

export function useProducts(all: boolean = true) {
  const { data, error, isLoading, mutate: mutateProducts } = useSWR<Product[]>(
    `${API_URL}/products?all=${all}`,
    () => getProducts({ all }),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { products: data || [], isLoading, error, mutate: mutateProducts };
}

export function useCategories() {
  const { data, error, isLoading, mutate: mutateCategories } = useSWR<{ category: string; count: number }[]>(
    `${API_URL}/products/categories`,
    getCategories,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { categories: data || [], isLoading, error, mutate: mutateCategories };
}

export function useToppings(all: boolean = true) {
  const { data, error, isLoading, mutate: mutateToppings } = useSWR<Topping[]>(
    `${API_URL}/products/toppings?all=${all}`,
    () => getToppings({ all }),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  return { toppings: data || [], isLoading, error, mutate: mutateToppings };
}

export async function refreshProducts() {
  await mutate(`${API_URL}/products?all=true`, getProducts({ all: true }), true);
  await mutate(`${API_URL}/products?all=false`, getProducts({ all: false }), true);
  await mutate(`${API_URL}/products/categories`, getCategories(), true);
  await mutate(`${API_URL}/products/toppings?all=true`, getToppings({ all: true }), true);
  await mutate(`${API_URL}/products/toppings?all=false`, getToppings({ all: false }), true);
}

export async function optimisticCreateProduct(data: any) {
  await createProduct(data);
  await refreshProducts();
}

export async function optimisticUpdateProduct(id: string, data: any) {
  await updateProduct(id, data);
  await refreshProducts();
}

export async function optimisticDeleteProduct(id: string) {
  await deleteProduct(id);
  await refreshProducts();
}

export async function optimisticCreateTopping(data: any) {
  await createTopping(data);
  await refreshProducts();
}

export async function optimisticUpdateTopping(id: string, data: any) {
  await updateTopping(id, data);
  await refreshProducts();
}

export async function optimisticDeleteTopping(id: string) {
  await deleteTopping(id);
  await refreshProducts();
}
