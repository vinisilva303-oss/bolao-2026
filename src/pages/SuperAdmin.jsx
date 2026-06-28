import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { getBolao, ativarPro } from '../lib/firestore'

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
