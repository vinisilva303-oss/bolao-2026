import { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '../lib/firebase'
import { salvarUsuario } from '../lib/firestore'
import { useAuth } from '../App'

export default function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin() {
    setEntrando(true)
    setErro('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await salvarUsuario(result.user)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErro('Erro ao entrar com Google. Tente novamente.')
        console.error(err)
      }
    } finally {
      setEntrando(false)
    }
  }

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--borda)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem' }}>
          <span>⚽</span>
          <span style={{ color: 'var(--verde-claro)' }}>Bolão</span>
          <span>Copa 2026</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={user.photoURL}
              alt={user.displayName}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--verde)' }}
            />
            <button
              className="btn-secundario"
              style={{ padding: '0.4rem 0.875rem', fontSize: '0.875rem' }}
              onClick={() => signOut(auth)}
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <main style={{ flex: 1 }}>
        <section style={{
          padding: '4rem 1rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #0d2818 0%, var(--bg) 100%)',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
              Seu bolão da<br />
              <span style={{ color: 'var(--ouro)' }}>Copa do Mundo 2026</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--texto-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Crie um bolão em minutos, compartilhe o link e acompanhe o ranking ao vivo.
              {!user && ' Grátis para até 10 participantes.'}
            </p>

            {user ? (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn-primario"
                  style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                  onClick={() => navigate('/criar')}
                >
                  ➕ Criar novo bolão
                </button>
                <button
                  className="btn-secundario"
                  style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                  onClick={() => navigate('/meus-boloes')}
                >
                  Meus bolões
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="btn-google"
                  style={{ margin: '0 auto', maxWidth: 340, borderRadius: 10 }}
                  onClick={handleLogin}
                  disabled={entrando}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2.1 1.5-4.7 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8H6.4C9.7 39.5 16.4 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                  </svg>
                  {entrando ? 'Entrando...' : 'Entrar com Google'}
                </button>
                {erro && <p className="erro-msg" style={{ marginTop: '0.75rem' }}>{erro}</p>}
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--texto-muted)' }}>
                  Ao entrar, você concorda com os termos de uso.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '3rem 1rem' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--texto-muted)' }}>
              Como funciona
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { icone: '🔗', titulo: 'Crie e compartilhe', desc: 'Crie seu bolão em segundos e compartilhe o link com todo mundo.' },
                { icone: '⚽', titulo: 'Registre palpites', desc: 'Cada participante dá seu palpite para todos os jogos da Copa.' },
                { icone: '🏆', titulo: 'Ranking ao vivo', desc: 'O ranking atualiza automaticamente conforme os resultados chegam.' },
              ].map((f) => (
                <div key={f.titulo} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icone}</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{f.titulo}</h3>
                  <p style={{ color: 'var(--texto-muted)', fontSize: '0.9rem' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section style={{ padding: '2rem 1rem 4rem' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Planos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', maxWidth: 680, margin: '0 auto' }}>
              {/* Free */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Free</h3>
                  <span className="tag-free">Grátis</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--texto-muted)', fontSize: '0.9rem' }}>
                  {['✅ 1 bolão ativo', '✅ Até 10 participantes', '✅ Ranking automático', '✅ Compartilha por link', '❌ Painel de resultados', '❌ Exportar ranking'].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {/* Pro */}
              <div className="card" style={{ borderColor: 'var(--ouro)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Pro ⭐</h3>
                  <span className="tag-pro">R$ 29 / bolão</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--texto-muted)', fontSize: '0.9rem' }}>
                  {['✅ Participantes ilimitados', '✅ Painel de resultados', '✅ Exportar ranking PDF', '✅ Badge "Bolão Oficial"', '✅ Suporte via WhatsApp', '✅ Pagamento via Pix'].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {!user && (
                  <button
                    className="btn-ouro"
                    style={{ width: '100%', marginTop: '1.25rem' }}
                    onClick={handleLogin}
                  >
                    Começar agora
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--borda)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--texto-muted)',
        fontSize: '0.85rem',
      }}>
        Bolão Copa 2026 · Feito com ❤️ para a Copa do Mundo
      </footer>
    </div>
  )
}
