import { createContext, useContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import Home from './pages/Home'
import CriarBolao from './pages/CriarBolao'
import BolaoPage from './pages/Bolao'
import AdminPage from './pages/Admin'
import MeusBoloes from './pages/MeusBoloes'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading"><div className="loading-spinner" /></div>
  if (!user) return <Navigate to="/" replace />
  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/criar" element={
            <ProtectedRoute><CriarBolao /></ProtectedRoute>
          } />
          <Route path="/bolao/:slug" element={<BolaoPage />} />
          <Route path="/admin/:slug" element={
            <ProtectedRoute><AdminPage /></ProtectedRoute>
          } />
          <Route path="/meus-boloes" element={
            <ProtectedRoute><MeusBoloes /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
