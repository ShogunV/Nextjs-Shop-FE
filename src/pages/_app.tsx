import '../styles/app.scss'
import type { AppProps } from 'next/app'
import { CartProvider } from '../context/cart'
import Layout from '../components/layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  )
}
export default MyApp
