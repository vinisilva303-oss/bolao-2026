import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { ouvirBolao } from '../lib/firestore'
import AdminComponent from '../components/Admin'
import UpgradePro from '../components/UpgradePro'

export default function AdminPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bolao, setBolao] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = ouvirBolao(slug, (b) => {
      setBolao(b)
      setLoading(false)
    })
    return unsub
  }, [slug])

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>

  if (!bolao || bolao.ownerId !== user?.uid) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2>Acesso negado</h2>
        <p style={{ color: 'var(--texto-muted)' }}>Apenas o criador do bolão pode acessar o painel admin.</p>
        <button className="btn-primario" onClick={() => navigate('/')}>Ir para o início</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--borda)', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>⚙️ Admin — {bolao.name}</span>
              {bolao.plan === 'pro' ? (
                <span className="tag-pro">PRO ⭐</span>
              ) : (
                <span className="tag-free">FREE</span>
              )}
            </div>
          </div>
          <button
            className="btn-secundario"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => navigate(`/bolao/${slug}`)}
          >
            Ver bolão
          </button>
        </div>
      </header>

      <div style={{ padding: '1rem' }}>
        <div className="container">
          {bolao.plan === 'free' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <UpgradePro slug={slug} />
            </div>
          )}
          <AdminComponent slug={slug} bolao={bolao} />
        </div>
      </div>
    </div>
  )
}
