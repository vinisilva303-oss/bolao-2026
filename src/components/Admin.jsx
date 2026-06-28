import { useState, useEffect, useRef, useCallback } from 'react'
import {
  GRUPOS, TIMES, gerarJogosGrupo,
  FASES_MATA_MATA, BRACKET_LABELS, KICKOFF_MAP, formatarHorarioBRT,
} from '../lib/dados'
import Flag from './Flag'
import {
  salvarResultadoGlobal, ouvirResultadosGlobais,
  salvarTimesMataMata, ouvirMataMata, atualizarCenario,
} from '../lib/firestore'

export default function AdminComponent({ slug, bolao }) {
  const [aba, setAba] = useState('grupos')
  const [salvandoCenario, setSalvandoCenario] = useState(false)
  const [resultados, setResultados] = useState({})
  const [mataMataTeams, setMataMataTeams] = useState({})
  const [edicao, setEdicao] = useState({})
  const [teamsEdit, setTeamsEdit] = useState({})
  const [saveStatus, setSaveStatus] = useState('idle')
  const [grupoAberto, setGrupoAberto] = useState('A')
  const [faseAberta, setFaseAberta] = useState('R32')

  // Refs para acesso atualizado nos callbacks de save
  const edicaoRef       = useRef(edicao)
  const teamsEditRef    = useRef(teamsEdit)
  const mataMataRef     = useRef(mataMataTeams)
  const resultTimers    = useRef({})
  const teamsTimers     = useRef({})
  const pendingCount    = useRef(0)

  useEffect(() => { edicaoRef.current = edicao }, [edicao])
  useEffect(() => { teamsEditRef.current = teamsEdit }, [teamsEdit])
  useEffect(() => { mataMataRef.current = mataMataTeams }, [mataMataTeams])

  useEffect(() => () => {
    Object.values(resultTimers.current).forEach(clearTimeout)
    Object.values(teamsTimers.current).forEach(clearTimeout)
  }, [])

  useEffect(() => {
    return ouvirResultadosGlobais((r) => {
      setResultados(r)
      setEdicao((prev) => {
        const next = { ...prev }
        for (const [id, val] of Object.entries(r)) {
          if (!next[id]) next[id] = { g1: String(val.g1), g2: String(val.g2) }
        }
        return next
      })
    })
  }, [])

  useEffect(() => { return ouvirMataMata(slug, setMataMataTeams) }, [slug])

  function markStatus(type) {
    if (type === 'start') {
      pendingCount.current += 1
      setSaveStatus((s) => s === 'error' ? s : 'saving')
    } else if (type === 'ok') {
      pendingCount.current = Math.max(0, pendingCount.current - 1)
      if (pendingCount.current === 0) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus((s) => s === 'saved' ? 'idle' : s), 3000)
      }
    } else if (type === 'err') {
      pendingCount.current = Math.max(0, pendingCount.current - 1)
      setSaveStatus('error')
    }
  }

  // ── Resultados ──────────────────────────────────────────────

  const doSaveResultado = useCallback(async (jogoId) => {
    const e = edicaoRef.current[jogoId] || {}
    if (e.g1 === '' || e.g1 === undefined || e.g2 === '' || e.g2 === undefined) return
    markStatus('start')
    try {
      await salvarResultadoGlobal(jogoId, Number(e.g1), Number(e.g2))
      markStatus('ok')
    } catch (err) {
      console.error(err)
      markStatus('err')
    }
  }, [])

  const setValor = useCallback((jogoId, lado, valor) => {
    const num = parseInt(valor, 10)
    const val = isNaN(num) ? '' : String(Math.max(0, Math.min(20, num)))
    setEdicao((prev) => ({ ...prev, [jogoId]: { ...prev[jogoId], [lado]: val } }))

    // Agenda save apenas quando ambos os campos estiverem preenchidos
    setSaveStatus((s) => s !== 'error' ? 'pending' : s)
    clearTimeout(resultTimers.current[jogoId])
    resultTimers.current[jogoId] = setTimeout(() => {
      const e = edicaoRef.current[jogoId] || {}
      const outro = lado === 'g1' ? e.g2 : e.g1
      const este  = isNaN(num) ? '' : val
      if (este !== '' && outro !== '' && outro !== undefined) {
        doSaveResultado(jogoId)
      } else {
        setSaveStatus((s) => s === 'pending' ? 'idle' : s)
      }
    }, 1200)
  }, [doSaveResultado])

  // ── Times Mata-Mata ─────────────────────────────────────────

  const doSaveTimes = useCallback(async (jogoId) => {
    const edit = teamsEditRef.current[jogoId] || {}
    const current = mataMataRef.current[jogoId] || {}
    const t1 = edit.t1 ?? current.t1 ?? ''
    const t2 = edit.t2 ?? current.t2 ?? ''
    if (!t1 || !t2) return
    markStatus('start')
    try {
      await salvarTimesMataMata(slug, jogoId, t1, t2)
      markStatus('ok')
    } catch (err) {
      console.error(err)
      markStatus('err')
    }
  }, [slug])

  const setTeamEdit = useCallback((jogoId, lado, val) => {
    setTeamsEdit((prev) => ({ ...prev, [jogoId]: { ...prev[jogoId], [lado]: val } }))
    setSaveStatus((s) => s !== 'error' ? 'pending' : s)
    clearTimeout(teamsTimers.current[jogoId])
    teamsTimers.current[jogoId] = setTimeout(() => {
      const edit    = teamsEditRef.current[jogoId] || {}
      const current = mataMataRef.current[jogoId] || {}
      const t1 = edit.t1 ?? current.t1 ?? ''
      const t2 = edit.t2 ?? current.t2 ?? ''
      if (t1 && t2) doSaveTimes(jogoId)
    }, 900)
  }, [doSaveTimes])

  // ── Cenário ─────────────────────────────────────────────────

  const cenario = bolao.cenario || 'antecipado'
  async function handleCenario(novo) {
    if (novo === cenario || salvandoCenario) return
    setSalvandoCenario(true)
    try { await atualizarCenario(slug, novo) }
    catch (err) { console.error(err); alert('Erro ao salvar configuração.') }
    finally { setSalvandoCenario(false) }
  }

  const totalSalvos = Object.keys(resultados).length

  return (
    <div>
      {/* Cenário */}
      <div style={{
        marginBottom: '1.25rem', padding: '0.875rem',
        background: 'var(--surface-2)', borderRadius: 10,
        border: '1px solid var(--borda)',
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--texto-muted)', marginBottom: '0.625rem' }}>
          Regra de palpites
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {[
            { id: 'antecipado',  label: 'Palpite Antecipado' },
            { id: 'jogo_a_jogo', label: 'Jogo a Jogo' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => handleCenario(id)} style={{
              padding: '0.35rem 0.875rem', borderRadius: 6, border: '1px solid', cursor: 'pointer',
              borderColor: cenario === id ? 'var(--verde)' : 'var(--borda)',
              background: cenario === id ? 'var(--verde)' : 'transparent',
              color: cenario === id ? '#fff' : 'var(--texto-muted)',
              fontWeight: cenario === id ? 600 : 400, fontSize: '0.85rem',
              opacity: salvandoCenario ? 0.6 : 1,
            }}>
              {label}
            </button>
          ))}
          {salvandoCenario && <span style={{ fontSize: '0.75rem', color: 'var(--texto-muted)', alignSelf: 'center' }}>Salvando…</span>}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--texto-muted)', lineHeight: 1.5 }}>
          {cenario === 'antecipado'
            ? '🟢 Participantes palpitam tudo antes do início da Copa. Grupos travam quando a Copa começa, mata-mata trava quando a fase começa.'
            : '🔵 Cada jogo trava individualmente no horário do apito. Participantes podem palpitar até o momento exato de cada partida.'}
        </div>
      </div>

      {/* Header resultados + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2>Resultados</h2>
        <SaveStatusChip status={saveStatus} onRetry={() => setSaveStatus('idle')} total={totalSalvos} />
      </div>
      <p style={{ color: 'var(--texto-muted)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        Digite o placar após cada jogo — salva automaticamente.
      </p>

      {/* Seletor fase */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[{ id: 'grupos', label: 'Fase de Grupos' }, { id: 'matamata', label: 'Mata-Mata' }].map((s) => (
          <button key={s.id} onClick={() => setAba(s.id)} style={{
            padding: '0.4rem 1rem', borderRadius: 8, border: '2px solid',
            borderColor: aba === s.id ? 'var(--verde)' : 'var(--borda)',
            background: aba === s.id ? 'var(--verde)' : 'transparent',
            color: aba === s.id ? '#fff' : 'var(--texto-muted)',
            fontWeight: aba === s.id ? 700 : 400, fontSize: '0.875rem', cursor: 'pointer',
          }}>{s.label}</button>
        ))}
      </div>

      {aba === 'grupos' ? (
        <>
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
            {Object.keys(GRUPOS).map((g) => {
              const salvos = gerarJogosGrupo(g).filter((j) => resultados[j.id]).length
              return (
                <button key={g} onClick={() => setGrupoAberto(g)} style={{
                  flexShrink: 0, padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid', cursor: 'pointer',
                  borderColor: grupoAberto === g ? 'var(--verde)' : 'var(--borda)',
                  background: grupoAberto === g ? 'var(--verde)' : 'transparent',
                  color: grupoAberto === g ? '#fff' : 'var(--texto-muted)',
                  fontWeight: grupoAberto === g ? 600 : 400, fontSize: '0.85rem', position: 'relative',
                }}>
                  {g}
                  {salvos > 0 && <BadgeCount n={salvos} />}
                </button>
              )
            })}
          </div>
          <GrupoResultados
            grupoId={grupoAberto} resultados={resultados}
            edicao={edicao} setValor={setValor}
          />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
            {FASES_MATA_MATA.map((fase) => {
              const salvos = fase.jogos.filter((id) => resultados[id]).length
              return (
                <button key={fase.id} onClick={() => setFaseAberta(fase.id)} style={{
                  flexShrink: 0, padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid', cursor: 'pointer',
                  borderColor: faseAberta === fase.id ? 'var(--verde)' : 'var(--borda)',
                  background: faseAberta === fase.id ? 'var(--verde)' : 'transparent',
                  color: faseAberta === fase.id ? '#fff' : 'var(--texto-muted)',
                  fontWeight: faseAberta === fase.id ? 600 : 400, fontSize: '0.85rem', position: 'relative',
                }}>
                  {fase.nome}
                  {salvos > 0 && <BadgeCount n={salvos} />}
                </button>
              )
            })}
          </div>
          <MataMataAdmin
            fase={FASES_MATA_MATA.find((f) => f.id === faseAberta)}
            resultados={resultados} mataMataTeams={mataMataTeams}
            edicao={edicao} teamsEdit={teamsEdit}
            setValor={setValor} setTeamEdit={setTeamEdit}
          />
        </>
      )}
    </div>
  )
}

// ── Utilitários visuais ─────────────────────────────────────

function BadgeCount({ n }) {
  return (
    <span style={{
      position: 'absolute', top: -4, right: -4,
      background: 'var(--sucesso)', color: '#fff',
      borderRadius: '50%', width: 14, height: 14,
      fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{n}</span>
  )
}

function SaveStatusChip({ status, onRetry, total }) {
  if (status === 'idle') return (
    <span style={{ fontSize: '0.75rem', color: 'var(--texto-muted)' }}>{total} resultado{total !== 1 ? 's' : ''} salvo{total !== 1 ? 's' : ''}</span>
  )
  if (status === 'pending') return (
    <span style={{ fontSize: '0.75rem', color: 'var(--texto-muted)' }}>● aguardando…</span>
  )
  if (status === 'saving') return (
    <span style={{ fontSize: '0.75rem', color: 'var(--verde-claro)' }}>⟳ salvando…</span>
  )
  if (status === 'saved') return (
    <span style={{ fontSize: '0.75rem', color: 'var(--verde)', fontWeight: 600 }}>✓ salvo</span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <span style={{ fontSize: '0.75rem', color: '#f87171' }}>⚠ erro ao salvar</span>
      <button onClick={onRetry} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 4, border: '1px solid #f87171', background: 'none', color: '#f87171', cursor: 'pointer' }}>
        fechar
      </button>
    </span>
  )
}

// ── Grupos ──────────────────────────────────────────────────

function GrupoResultados({ grupoId, resultados, edicao, setValor }) {
  const jogos = gerarJogosGrupo(grupoId)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {jogos.map((jogo) => {
        const e    = edicao[jogo.id] || {}
        const salvo = resultados[jogo.id]
        const isSaved = salvo && String(salvo.g1) === e.g1 && String(salvo.g2) === e.g2
        return (
          <ResultadoCard
            key={jogo.id} jogoId={jogo.id}
            t1Cod={jogo.t1} t1Nome={TIMES[jogo.t1]?.nome || jogo.t1}
            t2Cod={jogo.t2} t2Nome={TIMES[jogo.t2]?.nome || jogo.t2}
            edicao={e} isSaved={isSaved} setValor={setValor}
          />
        )
      })}
    </div>
  )
}

const scoreBoxStyle = {
  width: 44, textAlign: 'center', padding: '0.375rem',
  background: 'var(--surface-2)', borderRadius: 6,
  fontSize: '1rem', fontWeight: 700, color: 'var(--texto)', border: '1px solid var(--borda)',
}

function ResultadoCard({ jogoId, t1Cod, t1Nome, t2Cod, t2Nome, edicao: e, isSaved, setValor, kickoff }) {
  const horarioBRT = kickoff ? formatarHorarioBRT(kickoff) : ''
  const hasValue = e.g1 !== '' && e.g1 !== undefined && e.g2 !== '' && e.g2 !== undefined

  return (
    <div className="card" style={{ padding: '0.75rem 1rem', borderColor: isSaved ? 'var(--verde-escuro)' : undefined }}>
      {horarioBRT && (
        <div style={{ fontSize: '0.7rem', color: 'var(--texto-muted)', marginBottom: '0.375rem', textAlign: 'right' }}>
          {horarioBRT} BRT
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
          <div><Flag cod={t1Cod} size={22} /></div>
          <div style={{ fontSize: '0.78rem' }}>{t1Nome}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <input
              type="number" min="0" max="20" value={e.g1 ?? ''}
              onChange={(ev) => setValor(jogoId, 'g1', ev.target.value)}
              style={{ width: 44, textAlign: 'center', padding: '0.375rem' }}
            />
            <span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span>
            <input
              type="number" min="0" max="20" value={e.g2 ?? ''}
              onChange={(ev) => setValor(jogoId, 'g2', ev.target.value)}
              style={{ width: 44, textAlign: 'center', padding: '0.375rem' }}
            />
          </div>
          <div style={{ fontSize: '0.65rem', minHeight: 12, color: isSaved ? 'var(--verde)' : 'transparent' }}>
            {isSaved ? '✓ salvo' : '·'}
          </div>
        </div>
        <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
          <div><Flag cod={t2Cod} size={22} /></div>
          <div style={{ fontSize: '0.78rem' }}>{t2Nome}</div>
        </div>
      </div>
    </div>
  )
}

// ── Mata-Mata ───────────────────────────────────────────────

const timesOrdenados = Object.entries(TIMES).sort(([, a], [, b]) => a.nome.localeCompare(b.nome))

function MataMataAdmin({ fase, resultados, mataMataTeams, edicao, teamsEdit, setValor, setTeamEdit }) {
  if (!fase) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {fase.jogos.map((jogoId) => {
        const labels    = BRACKET_LABELS[jogoId] || ['Time A', 'Time B']
        const saved     = mataMataTeams[jogoId]
        const edit      = teamsEdit[jogoId] || {}
        const t1Cod     = edit.t1 ?? saved?.t1 ?? ''
        const t2Cod     = edit.t2 ?? saved?.t2 ?? ''
        const teamsSaved = !!(saved?.t1 && saved?.t2)
        const t1Nome    = t1Cod ? (TIMES[t1Cod]?.nome || t1Cod) : labels[0]
        const t2Nome    = t2Cod ? (TIMES[t2Cod]?.nome || t2Cod) : labels[1]
        const kickoff   = KICKOFF_MAP[jogoId]
        const horarioBRT = kickoff ? formatarHorarioBRT(kickoff) : ''
        const e         = edicao[jogoId] || {}
        const resultado = resultados[jogoId]
        const isSaved   = resultado && String(resultado.g1) === e.g1 && String(resultado.g2) === e.g2

        return (
          <div key={jogoId} className="card" style={{ padding: '0.875rem 1rem', borderColor: isSaved ? 'var(--verde-escuro)' : undefined }}>
            {/* Cabeçalho */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--texto-muted)', fontFamily: 'monospace' }}>{jogoId}</span>
              {horarioBRT && <span style={{ fontSize: '0.7rem', color: 'var(--texto-muted)' }}>{horarioBRT} BRT</span>}
            </div>

            {/* Seleção de times */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.625rem' }}>
              <TeamSelect
                value={t1Cod} placeholder={labels[0]}
                onChange={(v) => setTeamEdit(jogoId, 't1', v)}
                savedCod={saved?.t1}
              />
              <span style={{ textAlign: 'center', color: 'var(--texto-muted)', fontWeight: 700, fontSize: '0.85rem' }}>vs</span>
              <TeamSelect
                value={t2Cod} placeholder={labels[1]}
                onChange={(v) => setTeamEdit(jogoId, 't2', v)}
                savedCod={saved?.t2}
                alignRight
              />
            </div>

            {/* Resultado — só mostra quando times definidos */}
            {teamsSaved && (
              <ResultadoCard
                jogoId={jogoId}
                t1Cod={saved.t1} t1Nome={t1Nome}
                t2Cod={saved.t2} t2Nome={t2Nome}
                edicao={e} isSaved={isSaved} setValor={setValor}
              />
            )}
            {!teamsSaved && (
              <div style={{ fontSize: '0.78rem', color: 'var(--texto-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                Selecione os dois times para liberar o resultado
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TeamSelect({ value, placeholder, onChange, savedCod, alignRight }) {
  const isSaved = value && value === savedCod

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: alignRight ? 'flex-end' : 'flex-start', gap: '0.2rem' }}>
      {value && <Flag cod={value} size={20} />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '0.3rem 0.4rem', fontSize: '0.78rem',
          background: 'var(--surface-2)', borderRadius: 6, color: 'var(--texto)',
          border: `1px solid ${isSaved ? 'var(--verde-escuro)' : 'var(--borda)'}`,
          maxWidth: 130, width: '100%',
        }}
      >
        <option value="">{placeholder}</option>
        {timesOrdenados.map(([cod, t]) => (
          <option key={cod} value={cod}>{t.nome}</option>
        ))}
      </select>
      {isSaved && (
        <span style={{ fontSize: '0.6rem', color: 'var(--verde)', fontWeight: 600 }}>✓ salvo</span>
      )}
    </div>
  )
}
