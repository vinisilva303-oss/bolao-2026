import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ouvirBolao } from '../lib/firestore'
import Agenda from '../components/Agenda'
import Palpites from '../components/Palpites'
import Ranking from '../components/Ranking'

const ABAS = ['Palpites', 'Ranking', 'Agenda']

export default function BolaoPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [bolao, setBolao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('Palpites')

  useEffect(() => {
    const unsub = ouvirBolao(slug, (b) => {
      setBolao(b)
      setLoading(false)
    })
    return unsub
  }, [slug])

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>
  if (!bolao) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🔍</div>
      <h2>Bolão não encontrado</h2>
      <p style={{ color: 'var(--texto-muted)' }}>O link pode estar errado ou o bolão foi removido.</p>
      <button className="btn-primario" onClick={() => navigate('/')}>Ir para o início</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--borda)', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{bolao.name}</span>
              {bolao.plan === 'pro' && <span className="tag-pro">PRO ⭐</span>}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--texto-muted)' }}>bolao.app/{slug}</div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href)
              alert('Link copiado!')
            }}
            className="btn-secundario"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            📋 Copiar link
          </button>
        </div>
      </header>

      {/* Abas */}
      <div style={{ borderBottom: '1px solid var(--borda)', display: 'flex' }}>
        {ABAS.map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: 'none',
              border: 'none',
              borderBottom: aba === a ? '2px solid var(--verde)' : '2px solid transparent',
              color: aba === a ? 'var(--verde-claro)' : 'var(--texto-muted)',
              fontWeight: aba === a ? 600 : 400,
              borderRadius: 0,
              cursor: 'pointer',
            }}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: '1rem' }}>
        <div className="container">
          {aba === 'Palpites' && <Palpites slug={slug} bolao={bolao} />}
          {aba === 'Ranking' && <Ranking slug={slug} />}
          {aba === 'Agenda' && <Agenda />}
        </div>
      </div>
    </div>
  )
}
