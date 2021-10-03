import Head from 'next/head'
import Link from 'next/link'
import api from '../helpers/api'
import { GetServerSideProps } from 'next'
import React, { useRef } from 'react'
import { useCartContext, useGetTotalPrice, useGetTotalQuantity } from '../context/cart'
import router from 'next/router'
import { CartProduct } from '../types'
import { Toast } from 'primereact/toast'
import { confirmDialog } from 'primereact/confirmdialog';
import { useIsLoggedIn } from '../helpers/auth'
import { useEffect } from 'react'

// This gets called on every request
export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch data from external API
  const res = await api.get('/products')

  const products = res.data.products;

  // Pass data to the page via props
  return { props: { products } }
}

export default function Cart() {
  const toast = useRef<Toast>(null);
  const { cart, addToCart, removeOneFromCart, removeFromCart, clearCart } = useCartContext()
  const totalPrice = useGetTotalPrice()
  const totalQuantity = useGetTotalQuantity()
  const isLoggedIn = useIsLoggedIn()

  useEffect(() => {
    const { success, canceled } = router.query
    if (success) {
      return toast.current?.show({ severity: 'success', summary: 'Success Message', detail: 'Your purchase was successful', life: 3000 });
    }
    if (canceled) {
      return toast.current?.show({ severity: 'info', summary: 'Info Message', detail: 'Your purchase was not successful! Sorry!!!', life: 3000 });
    }
  }, [])

  const getDiscountPrice = (product: CartProduct) => {
    return (Math.round(product.price * (1 - (product.discount / 100)))).toFixed(2);
  }

  const getProductsPrice = (product: CartProduct) => {
    return (Math.round(product.quantity * Math.round(product.price * (1 - (product.discount / 100))))).toFixed(2);
  }

  const checkoutConfirm = () => {
    confirmDialog({
      message: `This is a portfolio web store. You CAN NOT buy anything here. DO NOT try to submit your real information.
      For card number use 4242 4242 4242 4242,
      any expiration date in the future,
      any three digit CVC code.`,
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      breakpoints: { '960px': '75vw', '640px': '100vw' },
      style: { width: '50vw' },
      acceptLabel: 'OK',
      rejectLabel: 'Cancel',
      accept: () => onAccept(),
      reject: () => { }
    });
  };

  const onAccept = () => {
    return api.post('checkout-session', { total: totalPrice, totalQuantity, cart }).then(res => {
      return router.push(res.data['url'])
    }).catch(e => console.log(e))
  }

  const handleCheckout = () => {
    if (!isLoggedIn) {
      return toast.current?.show({ severity: 'info', summary: 'Info Message', detail: 'You need to be logged in to continue with your purchase', life: 3000 });
    }
    checkoutConfirm()
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mb-3">
        <h1 className="text-center my-3">Cart</h1>
        {cart.length > 0 ?
          <>
            <div className="row mb-3">
              <div className="d-flex justify-content-end">
                <button className="btn btn-sm btn-danger" onClick={clearCart}><i className="pi pi-trash me-1"></i><span>Clear cart</span></button>
              </div>
            </div>
            <div className="row">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Product</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Before Discount</th>
                    <th scope="col">Discount</th>
                    <th scope="col">After Discount</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((product: CartProduct) => {
                    const discountPrice = getDiscountPrice(product)
                    const productsPrice = getProductsPrice(product)
                    return (
                      <tr key={product.id}>
                        <th scope="row">#</th>
                        <td>{product.title}</td>
                        <td>
                          <button className="btn btn-sm px-1 mx-1" onClick={() => addToCart(product)}>+</button>
                          {product.quantity}
                          <button className="btn btn-sm px-1 mx-1" onClick={() => removeOneFromCart(product)}>-</button>
                          <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(product)}><i className="pi pi-trash"></i></button>
                        </td >
                        <td>{(product.price).toFixed(2)}</td>
                        <td>{product.discount} %</td>
                        <td>{`${discountPrice} €`}</td>
                        <td>{`${productsPrice} €`}</td>
                      </tr >
                    )
                  })}

                  <tr>
                    <td colSpan={6}>Total Price</td>
                    <td>{`${totalPrice} €`}</td>
                  </tr>
                </tbody>
              </table >
            </div>

            <div className="row">
              <div className="d-flex justify-content-between">
                <Link href="/" passHref><button className="btn btn-secondary">Back</button></Link>
                <button className="btn btn-success pull-right" onClick={() => handleCheckout()} > Checkout</button >
              </div>
            </div>
          </>
          :
          <>
            <div className="row mb-5">
              <h4 className="d-flex justify-content-center mt-5">There are no products</h4>
            </div>
            <Link href="/" passHref><button className="btn btn-secondary">Back</button></Link>
          </>
        }
      </main >
      <Toast ref={toast} />
    </div >
  )
}
