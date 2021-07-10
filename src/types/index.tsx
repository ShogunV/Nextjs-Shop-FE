export type Product = {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  discount: number;
}

export interface CartProduct extends Product {
  quantity: number;
}

export interface Cart extends Array<CartProduct> {
  [key: number]: CartProduct;
}
