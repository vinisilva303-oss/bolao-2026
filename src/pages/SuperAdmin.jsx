import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { getBolao, ativarPro, listarTodosBoloes, reatribuirDono } from '../lib/firestore'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export default function SuperAdmin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [slug, setSlug] = useState('')
  const [bolao, setBolao] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [ativando, setAtivando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [todosBoloes, setTodosBoloes] = useState(null)
  const [carregandoTodos, setCarregandoTodos] = useState(false)
  const [reatribuindo, setReatribuindo] = useState(null)

  const isAdmin = user?.email === ADMIN_EMAIL

  async function buscar(e) {
    e.preventDefault()
    if (!slug.trim()) return
    setBuscando(true)
    setErro('')
    setBolao(null)
    setSucesso('')
    try {
      const b = await getBolao(slug.trim())
      if (!b) setErro('Bolão não encontrado.')
      else setBolao(b)
    } catch (err) {
      setErro('Erro ao buscar bolão.')
    } finally {
      setBuscando(false)
    }
  }

  async function ativar() {
    if (!bolao) return
    setAtivando(true)
    setErro('')
    try {
      await ativarPro(bolao.id)
      setBolao((prev) => ({ ...prev, plan: 'pro' }))
      setSucesso(`✅ Bolão "${bolao.name}" ativado para Pro com sucesso!`)
    } catch (err) {
      setErro('Erro ao ativar Pro. Verifique as permissões do Firestore.')
      console.error(err)
    } finally {
      setAtivando(false)
    }
  }

  async function handleListarTodos() {
    setCarregandoTodos(true)
    try {
      const lista = await listarTodosBoloes()
      setTodosBoloes(lista.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)))
    } catch (err) {
      console.error(err)
      alert('Erro ao listar bolões.')
    } finally {
      setCarregandoTodos(false)
    }
  }

  async function handleReatribuir(slug) {
    if (!user) return
    setReatribuindo(slug)
    try {
      await reatribuirDono(slug, user.uid)
      setTodosBoloes((prev) => prev.map((b) => b.id === slug ? { ...b, ownerId: user.uid } : b))
    } catch (err) {
      console.error(err)
      alert('Erro ao reatribuir. Tente pelo console do Firebase.')
    } finally {
      setReatribuindo(null)
    }
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2>Acesso restrito</h2>
        <p style={{ color: 'var(--texto-muted)', textAlign: 'center' }}>
          {!ADMIN_EMAIL
            ? 'Configure VITE_ADMIN_EMAIL no .env.local e no Vercel.'
            : 'Apenas o administrador do app pode acessar esta página.'}
        </p>
        <button className="btn-secundario" onClick={() => navigate('/')}>Voltar</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', color: 'var(--texto-muted)', padding: 0, fontSize: '0.9rem' }}>← Voltar</button>
          <h1>Painel Admin</h1>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Ativar Plano Pro</h2>
          <p style={{ color: 'var(--texto-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Cole o slug do bolão que o cliente enviou no comprovante.
          </p>

          <form onSubmit={buscar} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="slug-do-bolao"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primario" style={{ flexShrink: 0 }} disabled={buscando}>
              {buscando ? '...' : 'Buscar'}
            </button>
          </form>

          {erro && <p className="erro-msg">{erro}</p>}
          {sucesso && <p style={{ color: 'var(--sucesso)', fontSize: '0.9rem' }}>{sucesso}</p>}

          {bolao && (
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '1rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{bolao.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--texto-muted)', fontFamily: 'monospace' }}>{bolao.id}</div>
                  <div style={{ marginTop: '0.375rem' }}>
                    {bolao.plan === 'pro'
                      ? <span className="tag-pro">PRO ⭐ — já ativo</span>
                      : <span className="tag-free">FREE</span>}
                  </div>
                </div>
                {bolao.plan !== 'pro' && (
                  <button
                    className="btn-ouro"
                    onClick={ativar}
                    disabled={ativando}
                    style={{ flexShrink: 0 }}
                  >
                    {ativando ? 'Ativando...' : '⭐ Ativar Pro'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Listar todos os bolões */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Todos os Bolões</h2>
            <button
              className="btn-secundario"
              style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem' }}
              onClick={handleListarTodos}
              disabled={carregandoTodos}
            >
              {carregandoTodos ? 'Carregando...' : '🔍 Listar todos'}
            </button>
          </div>
          <p style={{ color: 'var(--texto-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            UID atual: <code style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{user?.uid}</code>
          </p>

          {todosBoloes !== null && todosBoloes.length === 0 && (
            <p style={{ color: 'var(--texto-muted)', fontSize: '0.875rem' }}>Nenhum bolão no Firestore.</p>
          )}

          {todosBoloes && todosBoloes.map((b) => {
            const slug = b.slug || b.id
            const meuBolao = b.ownerId === user?.uid
            return (
              <div key={b.id} style={{
                background: 'var(--surface-2)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem',
                border: `1px solid ${meuBolao ? 'var(--verde-escuro)' : 'var(--borda)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{b.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--texto-muted)', fontFamily: 'monospace' }}>{slug}</div>
                    <div style={{ fontSize: '0.7rem', color: meuBolao ? 'var(--verde)' : '#f87171', marginTop: '0.2rem' }}>
                      {meuBolao ? '✓ seu bolão' : `dono: ${b.ownerId?.slice(0, 12)}…`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn-secundario"
                      style={{ padding: '0.3rem 0.625rem', fontSize: '0.78rem' }}
                      onClick={() => navigate(`/bolao/${slug}`)}
                    >
                      Ver
                    </button>
                    {!meuBolao && (
                      <button
                        className="btn-primario"
                        style={{ padding: '0.3rem 0.625rem', fontSize: '0.78rem' }}
                        disabled={reatribuindo === slug}
                        onClick={() => handleReatribuir(slug)}
                      >
                        {reatribuindo === slug ? '...' : 'Assumir dono'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Instruções */}
        <div className="card" style={{ fontSize: '0.875rem', color: 'var(--texto-muted)' }}>
          <h3 style={{ color: 'var(--texto)', marginBottom: '0.75rem', fontSize: '1rem' }}>Como funciona</h3>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Cliente paga R$29 via Pix e envia comprovante pelo WhatsApp.</li>
            <li>Você recebe o slug do bolão na mensagem pré-preenchida.</li>
            <li>Cole o slug no campo acima, clique Buscar e depois Ativar Pro.</li>
            <li>O cliente vê o badge Pro imediatamente (atualização em tempo real).</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
