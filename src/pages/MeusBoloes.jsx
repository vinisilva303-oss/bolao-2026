import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../App'
import { auth } from '../lib/firebase'
import { getBoloesPorOwner } from '../lib/firestore'

export default function MeusBoloes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [boloes, setBoloes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getBoloesPorOwner(user.uid)
      .then((lista) => { setBoloes(lista); setLoading(false) })
      .catch((err) => { console.error(err); setLoading(false) })
  }, [user])

  function copiarLink(slug) {
    navigator.clipboard?.writeText(`${window.location.origin}/bolao/${slug}`)
      .then(() => alert('Link copiado!'))
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--borda)', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', color: 'var(--verde-claro)', padding: 0, fontWeight: 600, fontSize: '1rem' }}
          >
            ⚽ Bolão Copa 2026
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={user?.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
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

          {loading && <div className="loading" style={{ minHeight: 200 }}><div className="loading-spinner" /></div>}

          {!loading && boloes.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚽</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Nenhum bolão ainda</h2>
              <p style={{ color: 'var(--texto-muted)', marginBottom: '1.5rem' }}>
                Crie seu primeiro bolão e compartilhe com os amigos!
              </p>
              <button className="btn-primario" onClick={() => navigate('/criar')}>
                Criar bolão grátis
              </button>
            </div>
          )}

          {!loading && boloes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {boloes.map((bolao) => (
                <div key={bolao.id} className="card" style={{ borderColor: bolao.plan === 'pro' ? 'var(--ouro)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{bolao.name}</span>
                        {bolao.plan === 'pro' ? (
                          <span className="tag-pro">PRO ⭐</span>
                        ) : (
                          <span className="tag-free">FREE</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--texto-muted)', fontFamily: 'monospace' }}>
                        /bolao/{bolao.slug || bolao.id}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
                      <button
                        onClick={() => copiarLink(bolao.slug || bolao.id)}
                        style={{ background: 'none', border: '1px solid var(--borda)', color: 'var(--texto-muted)', padding: '0.4rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        📋 Copiar link
                      </button>
                      <button
                        className="btn-secundario"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/bolao/${bolao.slug || bolao.id}`)}
                      >
                        Ver bolão
                      </button>
                      <button
                        className="btn-primario"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/admin/${bolao.slug || bolao.id}`)}
                      >
                        ⚙️ Admin
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
