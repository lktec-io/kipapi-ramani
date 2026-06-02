import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Navbar    from './components/layout/Navbar/Navbar.jsx'
import Footer    from './components/layout/Footer/Footer.jsx'
import AppRouter from './routes/AppRouter.jsx'
import './styles/globals.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-shell">
            <Navbar />
            <main className="main-content">
              <AppRouter />
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
