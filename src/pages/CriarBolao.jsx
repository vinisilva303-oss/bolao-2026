import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { criarBolao } from '../lib/firestore'
import { gerarSlug } from '../lib/dados'

export default function CriarBolao() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [criando, setCriando] = useState(false)

  const slugPreview = nome ? gerarSlug(nome) : ''

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setCriando(true)
    setErro('')
    try {
      const slug = gerarSlug(nome)
      await criarBolao({ slug, name: nome.trim(), ownerId: user.uid })
      navigate(`/admin/${slug}`)
    } catch (err) {
      setErro(err.message || 'Erro ao criar bolão. Tente novamente.')
    } finally {
      setCriando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', color: 'var(--texto-muted)', padding: '0.25rem 0', marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          ← Voltar
        </button>

        <h1 style={{ marginBottom: '0.5rem' }}>Criar Bolão</h1>
        <p style={{ color: 'var(--texto-muted)', marginBottom: '2rem' }}>
          Escolha um nome para o seu bolão. Um link único será gerado automaticamente.
        </p>

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label htmlFor="nome">Nome do bolão</label>
            <input
              id="nome"
              type="text"
              placeholder="ex: Bolão da Família Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={60}
              required
            />
          </div>

          {slugPreview && (
            <div style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--borda)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}>
              <span style={{ color: 'var(--texto-muted)' }}>Link: </span>
              <span style={{ color: 'var(--verde-claro)' }}>
                {window.location.origin}/bolao/<strong>{slugPreview}</strong>
              </span>
            </div>
          )}

          {erro && <p className="erro-msg" style={{ marginBottom: '1rem' }}>{erro}</p>}

          <button
            type="submit"
            className="btn-primario"
            style={{ width: '100%', fontSize: '1.05rem' }}
            disabled={criando || !nome.trim()}
          >
            {criando ? 'Criando...' : '🚀 Criar bolão grátis'}
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--texto-muted)', textAlign: 'center' }}>
            Plano Free: até 10 participantes · <a href="/">Ver planos</a>
          </p>
        </form>
      </div>
    </div>
  )
}
