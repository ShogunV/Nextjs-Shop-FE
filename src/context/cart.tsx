import { useState } from 'react';
import { createContext, useContext } from 'react';
import { Cart, CartProduct } from '../types';

type CartContent = {
  cart: Array<CartProduct>,
  addToCart: (product: CartProduct) => void,
  removeOneFromCart: (product: CartProduct) => void,
  removeFromCart: (product: CartProduct) => void,
  clearCart: () => void
}

type Props = {
  children: React.ReactNode
};

const CartContext = createContext<CartContent>({
  cart: [],
  addToCart: () => { },
  removeOneFromCart: () => { },
  removeFromCart: () => { },
  clearCart: () => { }
});

export function CartProvider({ children }: Props) {
  const [cart, setCart] = useState<Cart>([])

  const addToCart = (product: CartProduct) => {
    const newCart: Cart = [...cart]
    const productInCart = newCart.find(cartProduct => cartProduct.id === product.id)
    if (productInCart) {
      productInCart.quantity++
      return setCart(newCart)
    } else {
      return setCart([...newCart, product])
    }
  }

  const removeOneFromCart = (product: CartProduct) => {
    const newCart: Cart = [...cart]
    const productInCart = newCart.find(cartProduct => cartProduct.id === product.id)
    if (!productInCart) {
      return
    }
    if (productInCart.quantity > 1) {
      productInCart.quantity = productInCart.quantity - 1
      return setCart(newCart)
    }
    if (productInCart.quantity === 1) {
      return setCart(newCart.filter(el => el.id !== productInCart.id))
    }
  }

  const removeFromCart = (product: CartProduct) => {
    return setCart(cart.filter(el => el.id !== product.id))
  }

  const clearCart = () => {
    return setCart([])
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeOneFromCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  return useContext(CartContext);
}

export function useCart() {
  const { cart } = useCartContext()
  return cart
}

export function useGetTotalPrice() {
  const cart = useCart()
  return (cart.reduce((sum, cartItem: CartProduct) => {
    return sum += Math.round(Math.round(cartItem.price * (1 - (cartItem.discount / 100)))) * cartItem.quantity;
  }, 0)).toFixed(2);
}

export function useGetTotalQuantity() {
  const cart = useCart()
  return cart.reduce((tq, cartItem: CartProduct) => {
    return tq += cartItem.quantity;
  }, 0);
}
