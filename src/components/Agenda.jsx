import { useState, useMemo } from 'react'
import { GRUPOS, TIMES, gerarJogosGrupo, formatarHorarioBRT, FASES_MATA_MATA, BRACKET_LABELS, KICKOFF_MAP } from '../lib/dados'
import { useNow } from '../lib/useNow'
import Flag from './Flag'

const SETORES = [
  { id: 'cronologico', label: '🕐 Cronológico' },
  { id: 'grupos',      label: 'Grupos' },
  { id: 'matamata',    label: 'Mata-Mata' },
]

function palpiteCompleto(p) {
  return p && p.g1 !== '' && p.g1 !== undefined && p.g2 !== '' && p.g2 !== undefined
}

const FMT_DATA = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' })
function dataBRT(ts) { return FMT_DATA.format(new Date(ts)) }

export default function Agenda({ onJogoClick, palpites = {} }) {
  const now = useNow(60000)
  const hojeStr = useMemo(() => dataBRT(now), [now])
  const [setor, setSetor] = useState('cronologico')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2>Agenda</h2>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {SETORES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSetor(s.id)}
              style={{
                padding: '0.35rem 0.875rem', borderRadius: 8, border: '2px solid',
                borderColor: setor === s.id ? 'var(--verde)' : 'var(--borda)',
                background: setor === s.id ? 'var(--verde)' : 'transparent',
                color: setor === s.id ? '#fff' : 'var(--texto-muted)',
                fontWeight: setor === s.id ? 700 : 400, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {setor === 'cronologico' && <AgendaCronologica now={now} hojeStr={hojeStr} onJogoClick={onJogoClick} palpites={palpites} />}
      {setor === 'grupos'      && <AgendaGrupos now={now} hojeStr={hojeStr} onJogoClick={onJogoClick} palpites={palpites} />}
      {setor === 'matamata'    && <AgendaMataMata now={now} hojeStr={hojeStr} onJogoClick={onJogoClick} palpites={palpites} />}
    </div>
  )
}

const FMT_DIA = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long' })

function AgendaCronologica({ now, hojeStr, onJogoClick, palpites }) {
  const jogos = useMemo(() => {
    const lista = []

    for (const [grupoId] of Object.entries(GRUPOS)) {
      for (const jogo of gerarJogosGrupo(grupoId)) {
        lista.push({
          id: jogo.id, t1: jogo.t1, t2: jogo.t2, kickoff: jogo.kickoff,
          label: `R${jogo.rodada} · Grupo ${grupoId}`,
        })
      }
    }

    for (const fase of FASES_MATA_MATA) {
      for (const jogoId of fase.jogos) {
        const kickoff = KICKOFF_MAP[jogoId]
        const labels  = BRACKET_LABELS[jogoId] || ['Time A', 'Time B']
        lista.push({
          id: jogoId, t1: null, t2: null, kickoff,
          t1Label: labels[0], t2Label: labels[1],
          label: `${fase.nome} · ${jogoId}`,
        })
      }
    }

    lista.sort((a, b) => {
      if (!a.kickoff && !b.kickoff) return 0
      if (!a.kickoff) return 1
      if (!b.kickoff) return -1
      return new Date(a.kickoff) - new Date(b.kickoff)
    })

    return lista
  }, [])

  // Agrupa por data BRT, filtrando dias anteriores a hoje
  const porDia = useMemo(() => {
    const mapa = new Map()
    for (const jogo of jogos) {
      const dataStr = jogo.kickoff ? dataBRT(jogo.kickoff) : null
      if (dataStr && dataStr < hojeStr) continue // oculta dias passados
      const dia = jogo.kickoff ? FMT_DIA.format(new Date(jogo.kickoff)) : 'A definir'
      if (!mapa.has(dia)) mapa.set(dia, [])
      mapa.get(dia).push(jogo)
    }
    return mapa
  }, [jogos, hojeStr])

  return (
    <>
      {[...porDia.entries()].map(([dia, lista]) => (
        <div key={dia} style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--verde-claro)', marginBottom: '0.75rem', fontSize: '0.95rem', textTransform: 'capitalize', fontWeight: 600 }}>
            {dia}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {lista.map((jogo) => {
              const travado = jogo.kickoff ? now >= new Date(jogo.kickoff).getTime() : false
              return <AgendaJogo key={jogo.id} jogo={jogo} travado={travado} label={jogo.label} onJogoClick={onJogoClick} completo={palpiteCompleto(palpites[jogo.id])} />
            })}
          </div>
        </div>
      ))}
    </>
  )
}

function AgendaGrupos({ now, hojeStr, onJogoClick, palpites }) {
  return (
    <>
      {Object.keys(GRUPOS).map((grupo) => {
        const todos = gerarJogosGrupo(grupo)
        const jogos = todos.filter((j) => !j.kickoff || dataBRT(j.kickoff) >= hojeStr)
        if (!jogos.length) return null
        const times = GRUPOS[grupo].times
        return (
          <div key={grupo} style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--verde-claro)', marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Grupo {grupo} —</span>
              {times.map((t) => <Flag key={t} cod={t} size={20} />)}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {jogos.map((jogo) => {
                const travado = jogo.kickoff ? now >= new Date(jogo.kickoff).getTime() : false
                return (
                  <AgendaJogo key={jogo.id} jogo={jogo} travado={travado} label={`R${jogo.rodada} · Grupo ${grupo}`} onJogoClick={onJogoClick} completo={palpiteCompleto(palpites[jogo.id])} />
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

function AgendaMataMata({ now, hojeStr, onJogoClick, palpites }) {
  return (
    <>
      {FASES_MATA_MATA.map((fase) => {
        const jogosFase = fase.jogos.filter((id) => {
          const k = KICKOFF_MAP[id]
          return !k || dataBRT(k) >= hojeStr
        })
        if (!jogosFase.length) return null
        return (
          <div key={fase.id} style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--verde-claro)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              {fase.nome}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {jogosFase.map((jogoId) => {
                const kickoff = KICKOFF_MAP[jogoId]
                const labels = BRACKET_LABELS[jogoId] || ['Time A', 'Time B']
                const travado = kickoff ? now >= new Date(kickoff).getTime() : false
                return (
                  <AgendaJogo
                    key={jogoId}
                    jogo={{ id: jogoId, t1: null, t2: null, kickoff, t1Label: labels[0], t2Label: labels[1] }}
                    travado={travado}
                    label={jogoId}
                    onJogoClick={onJogoClick}
                    completo={palpiteCompleto(palpites[jogoId])}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

function AgendaJogo({ jogo, travado, label, onJogoClick, completo }) {
  const t1Nome = jogo.t1 ? (TIMES[jogo.t1]?.nome || jogo.t1) : jogo.t1Label
  const t2Nome = jogo.t2 ? (TIMES[jogo.t2]?.nome || jogo.t2) : jogo.t2Label
  const clicavel = !!onJogoClick

  return (
    <div
      className="card"
      onClick={clicavel ? () => onJogoClick(jogo.id) : undefined}
      title={clicavel ? 'Ver palpite' : undefined}
      style={{
        padding: '0.75rem 1rem',
        opacity: travado ? 0.65 : 1,
        cursor: clicavel ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1, textAlign: 'right', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
          {jogo.t1 && <Flag cod={jogo.t1} size={20} />}
          <span>{t1Nome}</span>
        </div>
        <div style={{
          background: 'var(--surface-2)', padding: '0.25rem 0.75rem', borderRadius: 6,
          fontSize: '0.8rem', color: 'var(--texto-muted)', minWidth: 50, textAlign: 'center',
        }}>
          vs
        </div>
        <div style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span>{t2Nome}</span>
          {jogo.t2 && <Flag cod={jogo.t2} size={20} />}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--texto-muted)' }}>
          {label} · {jogo.kickoff ? formatarHorarioBRT(jogo.kickoff) + ' BRT' : 'A definir'}
        </span>
        {travado && <span title="Jogo já começou" style={{ fontSize: '0.75rem' }}>🔒</span>}
        {clicavel && !travado && !completo && <span style={{ fontSize: '0.7rem', color: 'var(--verde)', fontWeight: 600 }}>→ palpitar</span>}
        {clicavel && !travado && completo && <span style={{ fontSize: '0.7rem', color: 'var(--texto-muted)' }}>✓ palpitado</span>}
      </div>
    </div>
  )
}
