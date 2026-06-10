import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../App'
import { GRUPOS, TIMES, gerarJogosGrupo } from '../lib/dados'
import { salvarPalpites, ouvirPalpites, entrarNoBolao } from '../lib/firestore'

function getParticipanteId(slug, userId) {
  if (userId) return userId
  const key = `bolao_pid_${slug}`
  const stored = localStorage.getItem(key)
  if (stored) return stored
  const id = `anon_${Math.random().toString(36).substr(2, 12)}`
  localStorage.setItem(key, id)
  return id
}

export default function Palpites({ slug, bolao }) {
  const { user } = useAuth()
  const [participanteId] = useState(() => getParticipanteId(slug, user?.uid))
  const [nome, setNome] = useState('')
  const [nomeConfirmado, setNomeConfirmado] = useState(false)
  const [palpites, setPalpites] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [grupoAberto, setGrupoAberto] = useState('A')

  // Carrega palpites existentes e nome salvo
  useEffect(() => {
    const nomeLocal = localStorage.getItem(`bolao_nome_${slug}`)
    if (nomeLocal) { setNome(nomeLocal); setNomeConfirmado(true) }
    else if (user?.displayName) { setNome(user.displayName); setNomeConfirmado(true) }
  }, [slug, user])

  useEffect(() => {
    if (!participanteId || !nomeConfirmado) return
    const unsub = ouvirPalpites(slug, participanteId, (dados) => {
      setPalpites((prev) => ({ ...prev, ...dados }))
    })
    return unsub
  }, [slug, participanteId, nomeConfirmado])

  const setPlacar = useCallback((jogoId, lado, valor) => {
    const num = parseInt(valor, 10)
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [lado]: isNaN(num) ? '' : Math.max(0, Math.min(20, num)) },
    }))
  }, [])

  async function confirmarNome(e) {
    e.preventDefault()
    if (!nome.trim()) return
    localStorage.setItem(`bolao_nome_${slug}`, nome.trim())
    setNomeConfirmado(true)
  }

  async function salvar() {
    setSalvando(true)
    setSalvo(false)
    try {
      await entrarNoBolao(slug, { id: participanteId, name: nome.trim() || 'Anônimo' })
      // Filtra só jogos com os dois placares preenchidos
      const palpitesValidos = Object.fromEntries(
        Object.entries(palpites).filter(([, v]) => v.g1 !== '' && v.g1 !== undefined && v.g2 !== '' && v.g2 !== undefined)
      )
      await salvarPalpites(slug, participanteId, palpitesValidos)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 4000)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar palpites. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const totalPreenchidos = Object.values(palpites).filter(
    (p) => p?.g1 !== '' && p?.g1 !== undefined && p?.g2 !== '' && p?.g2 !== undefined
  ).length

  // Tela de entrada do nome
  if (!nomeConfirmado) {
    return (
      <div style={{ maxWidth: 400, margin: '2rem auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚽</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Entrar no bolão</h2>
          <p style={{ color: 'var(--texto-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Como você quer aparecer no ranking?
          </p>
          <form onSubmit={confirmarNome}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Seu nome ou apelido"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={40}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primario" style={{ width: '100%' }} disabled={!nome.trim()}>
              Entrar e palpitar →
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Cabeçalho do participante */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontWeight: 600 }}>Olá, {nome}!</span>
          <span style={{ color: 'var(--texto-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            {totalPreenchidos} jogos preenchidos
          </span>
        </div>
        <button
          onClick={() => setNomeConfirmado(false)}
          style={{ background: 'none', color: 'var(--texto-muted)', padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: '1px solid var(--borda)', borderRadius: 6 }}
        >
          Trocar nome
        </button>
      </div>

      {/* Grupos em abas horizontais */}
      <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
        {Object.keys(GRUPOS).map((g) => (
          <button
            key={g}
            onClick={() => setGrupoAberto(g)}
            style={{
              flexShrink: 0,
              padding: '0.375rem 0.75rem',
              borderRadius: 6,
              border: '1px solid',
              borderColor: grupoAberto === g ? 'var(--verde)' : 'var(--borda)',
              background: grupoAberto === g ? 'var(--verde)' : 'transparent',
              color: grupoAberto === g ? '#fff' : 'var(--texto-muted)',
              fontWeight: grupoAberto === g ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Jogos do grupo selecionado */}
      <GrupoJogos
        grupoId={grupoAberto}
        palpites={palpites}
        setPlacar={setPlacar}
      />

      {/* Botão salvar fixo */}
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderTop: '1px solid var(--borda)', marginTop: '1rem' }}>
        <button
          className={salvo ? 'btn-primario' : 'btn-primario'}
          style={{ width: '100%', fontSize: '1.05rem', background: salvo ? 'var(--sucesso)' : undefined }}
          onClick={salvar}
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : salvo ? `✅ Salvo! (${totalPreenchidos} palpites)` : `💾 Salvar palpites (${totalPreenchidos})`}
        </button>
      </div>
    </div>
  )
}

function GrupoJogos({ grupoId, palpites, setPlacar }) {
  const jogos = gerarJogosGrupo(grupoId)
  const times = GRUPOS[grupoId].times

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {times.map((t) => (
          <span key={t} style={{ fontSize: '0.85rem', color: 'var(--texto-muted)', background: 'var(--surface-2)', padding: '0.2rem 0.6rem', borderRadius: 99 }}>
            {TIMES[t]?.bandeira} {TIMES[t]?.nome || t}
          </span>
        ))}
      </div>

      {[1, 2, 3].map((rodada) => (
        <div key={rodada} style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--texto-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Rodada {rodada}
          </div>
          {jogos.filter((j) => j.rodada === rodada).map((jogo) => {
            const p = palpites[jogo.id] || {}
            const preenchido = p.g1 !== '' && p.g1 !== undefined && p.g2 !== '' && p.g2 !== undefined
            return (
              <div key={jogo.id} className="card" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', borderColor: preenchido ? 'var(--verde-escuro)' : undefined }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right', fontSize: '0.9rem', lineHeight: 1.3 }}>
                    <div>{TIMES[jogo.t1]?.bandeira}</div>
                    <div style={{ fontSize: '0.8rem' }}>{TIMES[jogo.t1]?.nome || jogo.t1}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input
                      type="number" min="0" max="20"
                      value={p.g1 ?? ''}
                      onChange={(e) => setPlacar(jogo.id, 'g1', e.target.value)}
                      style={{ width: 44, textAlign: 'center', padding: '0.375rem' }}
                    />
                    <span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span>
                    <input
                      type="number" min="0" max="20"
                      value={p.g2 ?? ''}
                      onChange={(e) => setPlacar(jogo.id, 'g2', e.target.value)}
                      style={{ width: 44, textAlign: 'center', padding: '0.375rem' }}
                    />
                  </div>
                  <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: 1.3 }}>
                    <div>{TIMES[jogo.t2]?.bandeira}</div>
                    <div style={{ fontSize: '0.8rem' }}>{TIMES[jogo.t2]?.nome || jogo.t2}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
