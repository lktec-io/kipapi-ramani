import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kr_cart')) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('kr_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (plan) => {
    setItems(prev => prev.find(i => i.id === plan.id) ? prev : [...prev, plan])
  }

  const removeFromCart = (planId) => {
    setItems(prev => prev.filter(i => i.id !== planId))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, item) => sum + Number(item.price), 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, count: items.length }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
