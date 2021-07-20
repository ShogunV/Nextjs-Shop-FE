export type Product = {
  id: number;
  title: string;
  description: string;
  image: File | string;
  price: number;
  discount: number;
  category: string;
  category_id: number;
}

export type ProductCategory = {
  id: number;
  title: string;
}

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ExtendedUser extends User {
  totalOrders: number;
  totalItems: number;
  totalDineros: number;
}

export type Order = {
  id: number;
  user: string;
  created_at: string;
  total: number;
  data: CartProduct[]
}

export interface CartProduct extends Product {
  quantity: number;
}

export interface Cart extends Array<CartProduct> {
  [key: number]: CartProduct;
}
