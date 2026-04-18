import useSWR, { mutate } from 'swr';
import { getProducts, getCategories, getToppings, createProduct, updateProduct, deleteProduct, createTopping, updateTopping, deleteTopping } from './api';
import type { Product, Topping } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function useProducts(all: boolean = true) {
  const { data, error, isLoading, mutate: mutateProducts } = useSWR<Product[]>(
    `${API_URL}/products?all=${all}`,
    () => getProducts({ all }),
    { revalidateOnFocus: false }
  );
  return { products: data || [], isLoading, error, mutate: mutateProducts };
}

export function useCategories() {
  const { data, error, isLoading, mutate: mutateCategories } = useSWR<{ category: string; count: number }[]>(
    `${API_URL}/products/categories`,
    getCategories,
    { revalidateOnFocus: false }
  );
  return { categories: data || [], isLoading, error, mutate: mutateCategories };
}

export function useToppings(all: boolean = true) {
  const { data, error, isLoading, mutate: mutateToppings } = useSWR<Topping[]>(
    `${API_URL}/products/toppings?all=${all}`,
    () => getToppings({ all }),
    { revalidateOnFocus: false }
  );
  return { toppings: data || [], isLoading, error, mutate: mutateToppings };
}

export async function refreshProducts() {
  await Promise.all([
    mutate(`${API_URL}/products`),
    mutate(`${API_URL}/products/categories`),
    mutate(`${API_URL}/products/toppings`),
  ]);
}

export async function optimisticCreateProduct(data: any) {
  return createProduct(data).then(() => refreshProducts());
}

export async function optimisticUpdateProduct(id: string, data: any) {
  return updateProduct(id, data).then(() => refreshProducts());
}

export async function optimisticDeleteProduct(id: string) {
  return deleteProduct(id).then(() => refreshProducts());
}

export async function optimisticCreateTopping(data: any) {
  return createTopping(data).then(() => refreshProducts());
}

export async function optimisticUpdateTopping(id: string, data: any) {
  return updateTopping(id, data).then(() => refreshProducts());
}

export async function optimisticDeleteTopping(id: string) {
  return deleteTopping(id).then(() => refreshProducts());
}
