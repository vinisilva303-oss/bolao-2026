import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { AGENDA_GRUPOS, TIMES } from '../lib/dados'
import { salvarPalpites, ouvirPalpites, entrarNoBolao } from '../lib/firestore'

export default function Palpites({ slug, bolao }) {
  const { user } = useAuth()
  const [nome, setNome] = useState(user?.displayName || '')
  const [participanteId] = useState(() => user?.uid || `anon_${Date.now()}`)
  const [palpites, setPalpites] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!participanteId) return
    const unsub = ouvirPalpites(slug, participanteId, setPalpites)
    return unsub
  }, [slug, participanteId])

  function setPlacar(jogoId, lado, valor) {
    const num = parseInt(valor, 10)
    if (isNaN(num) || num < 0 || num > 20) return
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [lado]: num },
    }))
  }

  async function salvar() {
    setSalvando(true)
    setSalvo(false)
    try {
      await entrarNoBolao(slug, { id: participanteId, name: nome || 'Anônimo' })
      await salvarPalpites(slug, participanteId, palpites)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar palpites. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const jogos = AGENDA_GRUPOS.slice(0, 12) // primeiros 2 grupos como preview

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Seu nome</label>
          <input
            type="text"
            placeholder="Como quer aparecer no ranking"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={40}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
        {jogos.map((jogo) => {
          const p = palpites[jogo.id] || {}
          return (
            <div key={jogo.id} className="card" style={{ padding: '0.875rem 1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                  {TIMES[jogo.t1]?.bandeira} {TIMES[jogo.t1]?.nome || jogo.t1}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <input
                    type="number"
                    min="0" max="20"
                    value={p.g1 ?? ''}
                    onChange={(e) => setPlacar(jogo.id, 'g1', e.target.value)}
                    style={{ width: 44, textAlign: 'center', padding: '0.375rem' }}
                  />
                  <span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span>
                  <input
                    type="number"
                    min="0" max="20"
                    value={p.g2 ?? ''}
                    onChange={(e) => setPlacar(jogo.id, 'g2', e.target.value)}
                    style={{ width: 44, textAlign: 'center', padding: '0.375rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  {TIMES[jogo.t2]?.nome || jogo.t2} {TIMES[jogo.t2]?.bandeira}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        className="btn-primario"
        style={{ width: '100%', fontSize: '1.05rem' }}
        onClick={salvar}
        disabled={salvando}
      >
        {salvando ? 'Salvando...' : salvo ? '✅ Palpites salvos!' : '💾 Salvar palpites'}
      </button>

      {bolao.plan === 'free' && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--texto-muted)', textAlign: 'center' }}>
          Plano Free exibe os primeiros 12 jogos. <a href={`/admin/${slug}`}>Upgrade para Pro</a> para todos os 104 jogos.
        </p>
      )}
    </div>
  )
}
