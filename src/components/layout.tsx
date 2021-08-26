import Header from './header'
import Footer from './footer'
import { ReactNode, FunctionComponent } from 'react'

type LayoutProps = {
  children: ReactNode
}

const Layout: FunctionComponent<LayoutProps> = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

export default Layout
