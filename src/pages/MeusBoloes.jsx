import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../App'
import { auth } from '../lib/firebase'
import { ouvirBoloesPorOwner, deletarBolao } from '../lib/firestore'

export default function MeusBoloes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [boloes, setBoloes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(null)
  const [confirmando, setConfirmando] = useState(null) // slug do bolão a confirmar exclusão
  const [excluindo, setExcluindo] = useState(null)     // slug sendo excluído

  useEffect(() => {
    if (!user) return
    return ouvirBoloesPorOwner(
      user.uid,
      (lista) => { setBoloes(lista); setLoading(false) },
      () => { setErro('Não foi possível carregar seus bolões.'); setLoading(false) },
    )
  }, [user])

  function copiarLink(slug) {
    const url = `${window.location.origin}/bolao/${slug}`
    navigator.clipboard?.writeText(url).then(() => {
      setCopiado(slug)
      setTimeout(() => setCopiado(null), 2500)
    })
  }

  async function handleExcluir(slug) {
    setExcluindo(slug)
    setConfirmando(null)
    try {
      await deletarBolao(slug)
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir o bolão. Tente novamente.')
    } finally {
      setExcluindo(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--borda)', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', color: 'var(--verde-claro)', padding: 0, fontWeight: 700, fontSize: '1rem' }}
          >
            ⚽ Bolão Copa 2026
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user?.photoURL && (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            )}
            <button
              className="btn-secundario"
              style={{ padding: '0.4rem 0.875rem', fontSize: '0.875rem' }}
              onClick={() => signOut(auth)}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '2rem 1rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1>Meus Bolões</h1>
            <button className="btn-primario" onClick={() => navigate('/criar')}>
              ➕ Novo bolão
            </button>
          </div>

          {loading && (
            <div className="loading" style={{ minHeight: 200 }}><div className="loading-spinner" /></div>
          )}

          {erro && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', borderColor: '#f87171' }}>
              <p style={{ color: '#f87171', marginBottom: '1rem' }}>{erro}</p>
              <button className="btn-primario" onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
          )}

          {!loading && !erro && boloes.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚽</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Nenhum bolão ainda</h2>
              <p style={{ color: 'var(--texto-muted)', marginBottom: '1.5rem' }}>
                Crie seu primeiro bolão e compartilhe com os amigos!
              </p>
              <button className="btn-primario" onClick={() => navigate('/criar')}>
                Criar bolão
              </button>
            </div>
          )}

          {!loading && boloes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {boloes.map((bolao) => {
                const slug = bolao.slug || bolao.id
                const estaExcluindo  = excluindo === slug
                const estaConfirmando = confirmando === slug

                return (
                  <div
                    key={bolao.id}
                    className="card"
                    style={{ cursor: estaExcluindo ? 'default' : 'pointer', opacity: estaExcluindo ? 0.5 : 1, transition: 'opacity 0.2s' }}
                    onClick={() => !estaExcluindo && !estaConfirmando && navigate(`/bolao/${slug}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                          {bolao.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--texto-muted)', fontFamily: 'monospace' }}>
                          {window.location.hostname}/bolao/{slug}
                        </div>
                      </div>

                      {/* Confirmação de exclusão */}
                      {estaConfirmando ? (
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span style={{ fontSize: '0.8rem', color: '#f87171' }}>Excluir este bolão?</span>
                          <span
                            onClick={() => handleExcluir(slug)}
                            style={{ fontSize: '0.8rem', color: '#f87171', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Sim
                          </span>
                          <span
                            onClick={() => setConfirmando(null)}
                            style={{ fontSize: '0.8rem', color: 'var(--texto-muted)', textDecoration: 'underline', cursor: 'pointer' }}
                          >
                            Não
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => copiarLink(slug)}
                            style={{
                              background: 'none', border: '1px solid var(--borda)',
                              color: copiado === slug ? 'var(--verde)' : 'var(--texto-muted)',
                              borderColor: copiado === slug ? 'var(--verde)' : 'var(--borda)',
                              padding: '0.4rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer',
                            }}
                          >
                            {copiado === slug ? '✓ Copiado!' : '📋 Copiar link'}
                          </button>
                          <button
                            className="btn-primario"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => navigate(`/admin/${slug}`)}
                          >
                            ⚙️ Admin
                          </button>
                          <button
                            onClick={() => setConfirmando(slug)}
                            disabled={!!excluindo}
                            style={{
                              padding: '0.4rem 0.625rem', borderRadius: 6, border: '1px solid var(--borda)',
                              background: 'none', color: '#f87171', fontSize: '0.85rem',
                              cursor: excluindo ? 'not-allowed' : 'pointer', lineHeight: 1,
                            }}
                            title="Excluir bolão"
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>

                    {estaExcluindo && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--texto-muted)', textAlign: 'center' }}>
                        Excluindo…
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
