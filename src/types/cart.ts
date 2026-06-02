import type { Product } from "./product";
export interface Cart {
    id: number;
    total: number;
    discountedTotal: number;
    totalProducts: number;
    totalQuantity: number;
    products: Product[];
}