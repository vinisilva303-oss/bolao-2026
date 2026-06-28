import { useState, useMemo } from 'react'
import { useRanking } from '../hooks/useRanking'
import {
  GRUPOS, TIMES, gerarJogosGrupo,
  FASES_MATA_MATA, BRACKET_LABELS, KICKOFF_MAP,
  calcularPontos,
} from '../lib/dados'
import Flag from './Flag'

// Ordem canônica de todos os jogos (grupos → mata-mata)
const ORDEM_JOGOS = [
  ...Object.keys(GRUPOS).flatMap((g) => gerarJogosGrupo(g).map((j) => j.id)),
  ...FASES_MATA_MATA.flatMap((f) => f.jogos),
]

// Mapa jogoId → { t1Nome, t2Nome, t1Cod, t2Cod }
const JOGO_INFO = {}
for (const [grupoId] of Object.entries(GRUPOS)) {
  for (const jogo of gerarJogosGrupo(grupoId)) {
    JOGO_INFO[jogo.id] = {
      t1Cod: jogo.t1, t1Nome: TIMES[jogo.t1]?.nome || jogo.t1,
      t2Cod: jogo.t2, t2Nome: TIMES[jogo.t2]?.nome || jogo.t2,
    }
  }
}
for (const fase of FASES_MATA_MATA) {
  for (const jogoId of fase.jogos) {
    const labels = BRACKET_LABELS[jogoId] || ['Time A', 'Time B']
    JOGO_INFO[jogoId] = { t1Cod: null, t1Nome: labels[0], t2Cod: null, t2Nome: labels[1] }
  }
}

const COR_PTS = { 3: 'var(--verde)', 1: 'var(--ouro)', 0: '#f87171' }

export default function Ranking({ slug }) {
  const { ranking, loading, resultados, todosPalpites } = useRanking(slug)
  const [abertos, setAbertos] = useState(new Set())

  const jogosApurados = useMemo(() => {
    return ORDEM_JOGOS
      .filter((id) => resultados[id])
      .sort((a, b) => {
        const ka = KICKOFF_MAP[a] ? new Date(KICKOFF_MAP[a]).getTime() : 0
        const kb = KICKOFF_MAP[b] ? new Date(KICKOFF_MAP[b]).getTime() : 0
        return ka - kb
      })
  }, [resultados])

  function toggleAberto(id) {
    setAbertos((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loading) return <div className="loading" style={{ minHeight: 200 }}><div className="loading-spinner" /></div>

  if (!ranking.length) return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--texto-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
      <p>O ranking aparecerá aqui quando houver resultados e palpites.</p>
    </div>
  )

  return (
    <div>
      <h2 style={{ marginBottom: '0.375rem' }}>Ranking</h2>
      {jogosApurados.length > 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--texto-muted)', marginBottom: '1.25rem' }}>
          Toque em um participante para ver os palpites nos {jogosApurados.length} jogo{jogosApurados.length !== 1 ? 's' : ''} apurado{jogosApurados.length !== 1 ? 's' : ''}.
        </p>
      )}
      {!jogosApurados.length && <div style={{ marginBottom: '1.25rem' }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ranking.map((p, i) => {
          const expandido = abertos.has(p.id)
          const palp = todosPalpites[p.id] || {}

          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: 0,
                borderColor: i === 0 ? 'var(--ouro)' : undefined,
                overflow: 'hidden',
              }}
            >
              {/* Linha principal — clicável se houver jogos apurados */}
              <div
                onClick={() => jogosApurados.length && toggleAberto(p.id)}
                style={{
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: jogosApurados.length ? 'pointer' : 'default',
                }}
              >
                {/* Posição */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i < 3 ? ['var(--ouro)', '#C0C0C0', '#CD7F32'][i] : 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem',
                  color: i < 3 ? '#1a1a1a' : 'var(--texto-muted)',
                }}>
                  {i + 1}
                </div>

                {/* Nome + stats */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--texto-muted)' }}>
                    {p.exatos} exato{p.exatos !== 1 ? 's' : ''} · {p.resultados} resultado{p.resultados !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Pontos + chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--verde-claro)', textAlign: 'right' }}>
                    {p.pontos}
                    <span style={{ fontSize: '0.75rem', color: 'var(--texto-muted)', fontWeight: 400 }}> pts</span>
                  </div>
                  {jogosApurados.length > 0 && (
                    <span style={{ color: 'var(--texto-muted)', fontSize: '0.75rem', transition: 'transform 0.2s', display: 'inline-block', transform: expandido ? 'rotate(180deg)' : 'none' }}>
                      ▼
                    </span>
                  )}
                </div>
              </div>

              {/* Palpites expandidos */}
              {expandido && (
                <div style={{ borderTop: '1px solid var(--borda)', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {jogosApurados.map((jogoId) => {
                    const resultado = resultados[jogoId]
                    const palpiteJogo = palp[jogoId]
                    const pts = calcularPontos(palpiteJogo, resultado)
                    const info = JOGO_INFO[jogoId] || {}
                    const temPalpite = palpiteJogo?.g1 !== undefined && palpiteJogo?.g1 !== '' &&
                                       palpiteJogo?.g2 !== undefined && palpiteJogo?.g2 !== ''

                    return (
                      <div key={jogoId} style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5rem 1fr auto 1fr auto',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.82rem',
                        padding: '0.3rem 0',
                        borderBottom: '1px solid var(--surface-2)',
                      }}>
                        {/* ID do jogo */}
                        <span style={{ fontFamily: 'monospace', color: 'var(--texto-muted)', fontSize: '0.72rem' }}>{jogoId}</span>

                        {/* Time 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', overflow: 'hidden' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.t1Nome}</span>
                          {info.t1Cod && <Flag cod={info.t1Cod} size={14} />}
                        </div>

                        {/* Palpite vs Resultado */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', minWidth: 80 }}>
                          {/* Palpite */}
                          <div style={{
                            padding: '0.15rem 0.5rem', borderRadius: 4,
                            fontWeight: 700, fontSize: '0.85rem',
                            background: temPalpite ? COR_PTS[pts] + '22' : 'var(--surface-2)',
                            color: temPalpite ? COR_PTS[pts] : 'var(--texto-muted)',
                            border: `1px solid ${temPalpite ? COR_PTS[pts] + '55' : 'transparent'}`,
                            minWidth: 48, textAlign: 'center',
                          }}>
                            {temPalpite ? `${palpiteJogo.g1} × ${palpiteJogo.g2}` : '– × –'}
                          </div>
                          {/* Resultado real */}
                          <div style={{ fontSize: '0.68rem', color: 'var(--texto-muted)' }}>
                            real: {resultado.g1} × {resultado.g2}
                          </div>
                        </div>

                        {/* Time 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden' }}>
                          {info.t2Cod && <Flag cod={info.t2Cod} size={14} />}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.t2Nome}</span>
                        </div>

                        {/* Pontos */}
                        <div style={{
                          fontWeight: 700, fontSize: '0.8rem',
                          color: temPalpite ? COR_PTS[pts] : 'var(--texto-muted)',
                          textAlign: 'right', minWidth: 28,
                        }}>
                          {temPalpite ? `+${pts}` : '–'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
