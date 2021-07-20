import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import api from '../helpers/api'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'
import { useCartContext } from '../context/cart'
import { Product } from '../types'
import Header from '../components/header'

// This gets called on every request
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category } = context.query
  // Fetch data from external API
  const res = await api.get('/products', { params: { category } })

  const products = res.data.products;

  // Pass data to the page via props
  return { props: { products } }
}

export default function Home(props: any) {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const allProducts = props.products
  const { addToCart } = useCartContext()

  useEffect(() => {
    setProducts(allProducts);
  }, [allProducts])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const searchTerm = e.target.value
    setSearch(searchTerm)
    if (!searchTerm) {
      return setProducts(allProducts)
    }
    const searchProducts = allProducts.filter(((product: Product) => product.title.toLowerCase().includes(searchTerm.toLowerCase())))
    return setProducts(searchProducts)
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
        <div className="row mb-3 d-flex justify-content-end">
          <div className="col-lg-4 col-sm-6">
            <input id="search" type="text" className="form-control" name="search" placeholder="Search..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e)} />
          </div>
        </div>

        <div className="row row-cols-2 row-cols-lg-5 g-2 g-lg-3">
          {products.map((product: Product) => {
            const price = product.price.toFixed(2);
            const discountPrice = Math.round(product.price * (1 - (product.discount / 100))).toFixed(2);
            return (
              <div key={product.id} className="col-sm-12 col-md-6 col-lg-4">
                <div className="card">
                  <Link href={`/products/${product.id}`} passHref >
                    <a>
                      <Image className="card-image-full" role="button" src={`http://localhost:8000/storage/${product.image ? product.image : 'images/No_image_available.png'}`} alt="Product image" width={'100%'} height={'100%'} layout='responsive' />
                    </a>
                  </Link>
                  <div className="card-body">
                    <Link href={`/products/${product.id}`} passHref ><h3 role="button">{product.title}</h3></Link>
                    <p>{product.description.split('\n')[0]}</p>
                    <div className="d-flex justify-content-between align-items-end">
                      {product.discount ?
                        <>
                          <div className="ribbon"><span>{-product.discount}%</span></div>
                          <div className="price pull-left">
                            <div className="full-price fs-6"><s>{`${price} €`}</s></div>
                            <div className="discount-price fs-5 fw-bold">{`${discountPrice} €`}</div>
                          </div>
                        </> :
                        <div className="price pull-left">
                          <div className="discount-price fs-5 fw-bold">{`${discountPrice} €`}</div>
                        </div>
                      }
                      <button type="button" className="btn btn-success pull-right cart" onClick={() => addToCart(product)}><i className="fa fa-shopping-cart" aria-hidden="true"></i><span className="glyphicon glyphicon-shopping-cart"></span>Add to cart</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="row">
          {products.length === 0 ? <h4 className="d-flex justify-content-center mt-5">There are no products</h4> : null}
        </div>
      </main>
    </div>
  )
}
