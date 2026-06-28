import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { ouvirBolao } from '../lib/firestore'
import AdminComponent from '../components/Admin'

export default function AdminPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bolao, setBolao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [linkCopiado, setLinkCopiado] = useState(false)

  useEffect(() => {
    return ouvirBolao(slug, (b) => { setBolao(b); setLoading(false) })
  }, [slug])

  function copiarLink() {
    const url = `${window.location.origin}/bolao/${slug}`
    navigator.clipboard?.writeText(url).then(() => {
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2500)
    })
  }

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>

  if (!bolao || bolao.ownerId !== user?.uid) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2>Acesso negado</h2>
        <p style={{ color: 'var(--texto-muted)' }}>Apenas o criador do bolão pode acessar o painel admin.</p>
        <button className="btn-primario" onClick={() => navigate('/meus-boloes')}>Meus bolões</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--borda)', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <button
              onClick={() => navigate('/meus-boloes')}
              style={{ background: 'none', color: 'var(--texto-muted)', padding: 0, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              ← Meus bolões
            </button>
            <span style={{ color: 'var(--borda)' }}>|</span>
            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ⚙️ {bolao.name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              className="btn-secundario"
              style={{ padding: '0.4rem 0.875rem', fontSize: '0.875rem' }}
              onClick={() => navigate(`/bolao/${slug}`)}
            >
              Ver bolão
            </button>
          </div>
        </div>
      </header>

      {/* Banner de convite */}
      <div style={{ background: '#0d2818', borderBottom: '1px solid var(--borda)', padding: '0.75rem 1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--texto-muted)', flexShrink: 0 }}>Link de convite:</span>
          <span style={{
            flex: 1, fontSize: '0.8rem', color: 'var(--verde-claro)', fontFamily: 'monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
          }}>
            {window.location.origin}/bolao/{slug}
          </span>
          <button
            onClick={copiarLink}
            style={{
              flexShrink: 0, padding: '0.3rem 0.875rem', borderRadius: 6, border: '1px solid var(--verde)',
              background: linkCopiado ? 'var(--verde)' : 'transparent',
              color: linkCopiado ? '#fff' : 'var(--verde-claro)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {linkCopiado ? '✓ Copiado!' : '📋 Copiar'}
          </button>
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        <div className="container">
          <AdminComponent slug={slug} bolao={bolao} />
        </div>
      </div>
    </div>
  )
}
