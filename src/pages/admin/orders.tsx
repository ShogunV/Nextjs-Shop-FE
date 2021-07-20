import Head from 'next/head'
import api from '../../helpers/api'
import { GetServerSideProps } from 'next'
import React from 'react'
import { Accordion, AccordionTab } from 'primereact/accordion';
import { CartProduct, Order } from '../../types'
import Header from '../../components/header'

// This gets called on every request
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Fetch data from external API
  try {
    const res = await api.get('admin/orders', {
      headers: context?.req?.headers?.cookie ? { cookie: context.req.headers.cookie } : undefined,
    })

    if (res.data.error) {
      return { redirect: { destination: '/', permanent: false } }
    }

    const orders = res.data.orders;
    // Pass data to the page via props
    return { props: { orders } }
  } catch (err) {
    return { redirect: { destination: '/', permanent: false } }
  }
}

export default function Orders(props: any) {
  const orders = props.orders

  const getDiscountPrice = (product: CartProduct) => {
    return (Math.round(product.price * (1 - (product.discount / 100)))).toFixed(2);
  }

  const getProductsPrice = (product: CartProduct) => {
    return (Math.round(product.quantity * Math.round(product.price * (1 - (product.discount / 100))))).toFixed(2);
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container">
        <h1>Orders</h1>

        <div className="card">
          <Accordion multiple>
            {orders.map((order: Order) => (
              <AccordionTab key={order.id} header={`${order.user}  -  ${order.created_at}`}>
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

                    {order['data'].map((item: CartProduct) => {
                      const discountPrice = getDiscountPrice(item)
                      const productsPrice = getProductsPrice(item)
                      return (
                        <tr key={item.id}>
                          <td></td>
                          <td>{item['title']}</td>
                          <td>{item['quantity']}</td>
                          <td>{item['price'] + ' €'}</td>
                          <td>{item['discount']}%</td>
                          <td>{discountPrice + ' €'}</td>
                          <td>{productsPrice + ' €'}</td>
                        </tr>
                      )
                    })}

                    <tr>
                      <td colSpan={6}>Total Price</td>
                      <td>{order.total + ' €'}</td>
                    </tr>
                  </tbody>
                </table>
              </AccordionTab>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  )
}
