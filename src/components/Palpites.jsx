import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { useAuth } from '../App'
import { auth, googleProvider } from '../lib/firebase'
import {
  GRUPOS, TIMES, gerarJogosGrupo, formatarHorarioBRT,
  FASES_MATA_MATA, BRACKET_LABELS, BRACKET_CODES, KICKOFF_MAP,
  JANELA_1_FIM, JANELA_3_INICIO, R32_CHAVEAMENTO, inferirClassificados,
} from '../lib/dados'

function resolverFoco(jogoId) {
  if (!jogoId) return null
  if (/^[A-L]\d$/.test(jogoId)) return { setor: 'grupos', grupo: jogoId[0], fase: null }
  const fase = FASES_MATA_MATA.find((f) => f.jogos.includes(jogoId))
  if (fase) return { setor: 'matamata', grupo: null, fase: fase.id }
  return null
}
import {
  salvarPalpites, ouvirPalpites, entrarNoBolao,
  salvarUsuario, ouvirMataMata,
} from '../lib/firestore'
import { useNow } from '../lib/useNow'
import Flag from './Flag'

const MATA_MATA_IDS = new Set(FASES_MATA_MATA.flatMap((f) => f.jogos))

const TIMES_ORDENADOS = Object.entries(TIMES).sort(([, a], [, b]) => a.nome.localeCompare(b.nome))

function getJanela(now, cenario) {
  if (cenario !== 'antecipado') return 'jogo_a_jogo'
  if (now < new Date(JANELA_1_FIM).getTime()) return 1
  if (now < new Date(JANELA_3_INICIO).getTime()) return 2
  return 3
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2.1 1.5-4.7 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8H6.4C9.7 39.5 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  )
}

export default function Palpites({ slug, bolao, focoJogoId, onFocoConsumido }) {
  const { user } = useAuth()
  const [logando, setLogando] = useState(false)
  const [erroLogin, setErroLogin] = useState('')

  async function handleLogin() {
    setLogando(true)
    setErroLogin('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await salvarUsuario(result.user)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setErroLogin('Erro ao entrar. Tente novamente.')
    } finally {
      setLogando(false)
    }
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: '2rem auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚽</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Entrar no bolão</h2>
          <p style={{ color: 'var(--texto-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Entre com sua conta Google para palpitar e acessar seus palpites de qualquer dispositivo.
          </p>
          <button
            className="btn-google"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}
            onClick={handleLogin} disabled={logando}
          >
            <GoogleIcon />
            {logando ? 'Entrando…' : 'Entrar com Google'}
          </button>
          {erroLogin && <p className="erro-msg" style={{ marginTop: '0.75rem' }}>{erroLogin}</p>}
        </div>
      </div>
    )
  }

  return <PalpitesForm slug={slug} bolao={bolao} user={user} focoJogoId={focoJogoId} onFocoConsumido={onFocoConsumido} />
}

function buildValidos(palpites) {
  const validos = {}
  for (const [id, v] of Object.entries(palpites)) {
    if (!v) continue
    const temScore = v.g1 !== '' && v.g1 !== undefined && v.g2 !== '' && v.g2 !== undefined
    const temTime  = MATA_MATA_IDS.has(id) && (v.t1 || v.t2)
    if (temScore || temTime) validos[id] = v
  }
  return validos
}

function PalpitesForm({ slug, bolao, user, focoJogoId, onFocoConsumido }) {
  const nomeKey = `bolao_nome_${slug}`
  const [nome, setNome] = useState(() => localStorage.getItem(nomeKey) || user.displayName || '')
  const [editandoNome, setEditandoNome] = useState(false)
  const [nomeTemp, setNomeTemp] = useState('')
  const [palpites, setPalpites] = useState({})
  const [mataMataTeams, setMataMataTeams] = useState({})
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  const [setor, setSetor] = useState('matamata')
  const [grupoAberto, setGrupoAberto] = useState('A')
  const [faseAberta, setFaseAberta] = useState('R32')
  const now = useNow()

  const participanteId = user.uid
  const cenario = bolao.cenario || 'antecipado'
  const janela = useMemo(() => getJanela(now, cenario), [now, cenario])
  const classificados = useMemo(() => inferirClassificados(palpites), [palpites])

  // Refs para acesso atualizado dentro de callbacks
  const palpitesRef = useRef(palpites)
  const nomeRef     = useRef(nome)
  const timerRef    = useRef(null)
  useEffect(() => { palpitesRef.current = palpites }, [palpites])
  useEffect(() => { nomeRef.current = nome }, [nome])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  useEffect(() => {
    entrarNoBolao(slug, { id: participanteId, name: nome.trim() || user.displayName || 'Participante' })
      .catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return ouvirPalpites(slug, participanteId, (dados) => {
      setPalpites((prev) => ({ ...prev, ...dados }))
    })
  }, [slug, participanteId])
  useEffect(() => { return ouvirMataMata(slug, setMataMataTeams) }, [slug])

  useEffect(() => {
    const foco = resolverFoco(focoJogoId)
    if (!foco) return
    if (foco.setor === 'grupos') {
      setSetor('grupos')
      setGrupoAberto(foco.grupo)
    } else {
      setSetor('matamata')
      setFaseAberta(foco.fase)
    }
    const timer = setTimeout(() => {
      document.getElementById(`jogo-${focoJogoId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (onFocoConsumido) onFocoConsumido()
    }, 120)
    return () => clearTimeout(timer)
  }, [focoJogoId]) // eslint-disable-line react-hooks/exhaustive-deps

  const doSave = useCallback(async () => {
    setSaveStatus('saving')
    try {
      await entrarNoBolao(slug, {
        id: participanteId,
        name: nomeRef.current.trim() || user.displayName || 'Participante',
      })
      await salvarPalpites(slug, participanteId, buildValidos(palpitesRef.current))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus((s) => s === 'saved' ? 'idle' : s), 3000)
    } catch (err) {
      console.error(err)
      setSaveStatus('error')
    }
  }, [slug, participanteId, user.displayName])

  const scheduleAutoSave = useCallback(() => {
    setSaveStatus('pending')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(doSave, 1500)
  }, [doSave])

  const setPlacar = useCallback((jogoId, lado, valor) => {
    const num = parseInt(valor, 10)
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [lado]: isNaN(num) ? '' : Math.max(0, Math.min(20, num)) },
    }))
    scheduleAutoSave()
  }, [scheduleAutoSave])

  const setTime = useCallback((jogoId, lado, cod) => {
    setPalpites((prev) => ({ ...prev, [jogoId]: { ...prev[jogoId], [lado]: cod || undefined } }))
    scheduleAutoSave()
  }, [scheduleAutoSave])

  function abrirEditNome() { setNomeTemp(nome); setEditandoNome(true) }
  function confirmarEditNome(e) {
    e.preventDefault()
    const novo = nomeTemp.trim()
    if (!novo) return
    setNome(novo)
    localStorage.setItem(nomeKey, novo)
    setEditandoNome(false)
    scheduleAutoSave()
  }

  const totalPreenchidos = Object.entries(palpites).filter(
    ([, v]) => v?.g1 !== '' && v?.g1 !== undefined && v?.g2 !== '' && v?.g2 !== undefined
  ).length

  function isGrupoLocked(jogo) {
    if (cenario === 'jogo_a_jogo') return jogo.kickoff ? now >= new Date(jogo.kickoff).getTime() : false
    return janela >= 2
  }

  function isMataMataLocked(jogoId) {
    if (cenario === 'jogo_a_jogo') {
      const k = KICKOFF_MAP[jogoId]
      return k ? now >= new Date(k).getTime() : false
    }
    return janela >= 3
  }

  function resolverTime(jogoId, lado) {
    const knownCod = BRACKET_CODES[jogoId]?.[lado === 't1' ? 0 : 1]

    if (cenario === 'jogo_a_jogo') {
      const real = mataMataTeams[jogoId]?.[lado]
      if (real) return { cod: real, origem: 'real' }
      if (knownCod) return { cod: knownCod, origem: 'real' }
      return { cod: null, origem: 'tbd' }
    }
    if (janela === 1) {
      const stored = palpites[jogoId]?.[lado]
      if (stored) return { cod: stored, origem: 'user' }
      const mapa = R32_CHAVEAMENTO[jogoId]
      if (mapa) {
        const slot = mapa[lado]
        const g = classificados[slot.grupo]
        if (g) {
          const cod = slot.pos === 1 ? g.primeiro : g.segundo
          if (cod) return { cod, origem: 'inferido' }
        }
      }
      if (knownCod) return { cod: knownCod, origem: 'real' }
      return { cod: null, origem: 'tbd' }
    }
    const real = mataMataTeams[jogoId]?.[lado]
    if (real) return { cod: real, origem: 'real' }
    if (knownCod) return { cod: knownCod, origem: 'real' }
    const stored = palpites[jogoId]?.[lado]
    if (stored) return { cod: stored, origem: 'palpite' }
    return { cod: null, origem: 'tbd' }
  }

  function podeEditarTimes(jogoId) {
    if (cenario === 'jogo_a_jogo') return false
    return janela === 1 && !mataMataTeams[jogoId]?.t1
  }

  const bannerJanela = janela !== 'jogo_a_jogo' && (
    <div style={{
      fontSize: '0.8rem', padding: '0.5rem 0.875rem', borderRadius: 8, marginBottom: '1rem',
      background: janela === 1 ? '#0e3a1c' : janela === 2 ? '#1a2a0e' : '#2a1a0e',
      border: `1px solid ${janela === 1 ? 'var(--verde)' : janela === 2 ? '#6b9e3a' : 'var(--ouro)'}`,
      color: janela === 1 ? 'var(--verde-claro)' : janela === 2 ? '#a3c76a' : 'var(--ouro)',
    }}>
      {janela === 1 && '🟢 Janela 1 — Palpite tudo antes do início da Copa'}
      {janela === 2 && '🟡 Janela 2 — Grupos encerrados · Ajuste o mata-mata com os classificados reais'}
      {janela === 3 && '🔴 Janela 3 — Copa em andamento · Palpites encerrados'}
    </div>
  )

  const SaveChip = () => {
    if (saveStatus === 'idle') return (
      <span style={{ fontSize: '0.72rem', color: 'var(--texto-muted)' }}>
        {totalPreenchidos} palpites
      </span>
    )
    if (saveStatus === 'pending') return (
      <span style={{ fontSize: '0.72rem', color: 'var(--texto-muted)' }}>● aguardando…</span>
    )
    if (saveStatus === 'saving') return (
      <span style={{ fontSize: '0.72rem', color: 'var(--verde-claro)' }}>⟳ salvando…</span>
    )
    if (saveStatus === 'saved') return (
      <span style={{ fontSize: '0.72rem', color: 'var(--verde)', fontWeight: 600 }}>✓ salvo</span>
    )
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{ fontSize: '0.72rem', color: '#f87171' }}>⚠ erro ao salvar</span>
        <button
          onClick={doSave}
          style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 4, border: '1px solid #f87171', background: 'none', color: '#f87171', cursor: 'pointer' }}
        >
          tentar novamente
        </button>
      </span>
    )
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} referrerPolicy="no-referrer" />
          )}
          {editandoNome ? (
            <form onSubmit={confirmarEditNome} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <input type="text" value={nomeTemp} onChange={(e) => setNomeTemp(e.target.value)} maxLength={40} autoFocus style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', width: 160 }} />
              <button type="submit" className="btn-primario" style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem' }}>OK</button>
              <button type="button" onClick={() => setEditandoNome(false)} style={{ background: 'none', border: 'none', color: 'var(--texto-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
            </form>
          ) : (
            <button onClick={abrirEditNome} title="Editar apelido" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--texto)', fontWeight: 600, padding: 0 }}>
              {nome}<span style={{ color: 'var(--texto-muted)', fontSize: '0.75rem' }}>✏️</span>
            </button>
          )}
        </div>
        <SaveChip />
      </div>

      {bannerJanela}

      {/* Seletor Grupos / Mata-Mata */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[{ id: 'grupos', label: 'Fase de Grupos' }, { id: 'matamata', label: 'Mata-Mata' }].map((s) => (
          <button key={s.id} onClick={() => setSetor(s.id)} style={{
            padding: '0.4rem 1rem', borderRadius: 8, border: '2px solid', cursor: 'pointer',
            borderColor: setor === s.id ? 'var(--verde)' : 'var(--borda)',
            background: setor === s.id ? 'var(--verde)' : 'transparent',
            color: setor === s.id ? '#fff' : 'var(--texto-muted)',
            fontWeight: setor === s.id ? 700 : 400, fontSize: '0.875rem',
          }}>{s.label}</button>
        ))}
      </div>

      {setor === 'grupos' ? (
        <>
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
            {Object.keys(GRUPOS).map((g) => (
              <button key={g} onClick={() => setGrupoAberto(g)} style={{
                flexShrink: 0, padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid', cursor: 'pointer',
                borderColor: grupoAberto === g ? 'var(--verde)' : 'var(--borda)',
                background: grupoAberto === g ? 'var(--verde)' : 'transparent',
                color: grupoAberto === g ? '#fff' : 'var(--texto-muted)',
                fontWeight: grupoAberto === g ? 600 : 400, fontSize: '0.85rem',
              }}>{g}</button>
            ))}
          </div>
          <GrupoJogos grupoId={grupoAberto} palpites={palpites} setPlacar={setPlacar} isLocked={isGrupoLocked} />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
            {FASES_MATA_MATA.map((fase) => (
              <button key={fase.id} onClick={() => setFaseAberta(fase.id)} style={{
                flexShrink: 0, padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid', cursor: 'pointer',
                borderColor: faseAberta === fase.id ? 'var(--verde)' : 'var(--borda)',
                background: faseAberta === fase.id ? 'var(--verde)' : 'transparent',
                color: faseAberta === fase.id ? '#fff' : 'var(--texto-muted)',
                fontWeight: faseAberta === fase.id ? 600 : 400, fontSize: '0.85rem',
              }}>{fase.nome}</button>
            ))}
          </div>
          <MataMataFase
            fase={FASES_MATA_MATA.find((f) => f.id === faseAberta)}
            palpites={palpites} setPlacar={setPlacar} setTime={setTime}
            resolverTime={resolverTime} isLocked={isMataMataLocked}
            podeEditarTimes={podeEditarTimes} janela={janela}
          />
        </>
      )}
    </div>
  )
}

// ── Fase de Grupos ─────────────────────────────────────────

const scoreBoxStyle = {
  width: 44, textAlign: 'center', padding: '0.375rem',
  background: 'var(--surface-2)', borderRadius: 6,
  fontSize: '1rem', fontWeight: 700, color: 'var(--texto)', border: '1px solid var(--borda)',
}

function GrupoJogos({ grupoId, palpites, setPlacar, isLocked }) {
  const jogos = gerarJogosGrupo(grupoId)
  const times = GRUPOS[grupoId].times
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {times.map((t) => (
          <span key={t} style={{ fontSize: '0.85rem', color: 'var(--texto-muted)', background: 'var(--surface-2)', padding: '0.2rem 0.6rem', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Flag cod={t} size={16} /> {TIMES[t]?.nome || t}
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
            const travado = isLocked(jogo)
            const preenchido = p.g1 !== '' && p.g1 !== undefined && p.g2 !== '' && p.g2 !== undefined
            const horarioBRT = jogo.kickoff ? formatarHorarioBRT(jogo.kickoff) : ''
            return (
              <MatchCard
                key={jogo.id} jogoId={jogo.id}
                t1Cod={jogo.t1} t1Nome={TIMES[jogo.t1]?.nome || jogo.t1}
                t2Cod={jogo.t2} t2Nome={TIMES[jogo.t2]?.nome || jogo.t2}
                palpite={p} preenchido={preenchido} travado={travado}
                horarioBRT={horarioBRT} setPlacar={setPlacar}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function MatchCard({ jogoId, t1Cod, t1Nome, t2Cod, t2Nome, palpite: p, preenchido, travado, horarioBRT, setPlacar }) {
  return (
    <div id={`jogo-${jogoId}`} className="card" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', borderColor: travado ? 'var(--borda)' : preenchido ? 'var(--verde-escuro)' : undefined, opacity: travado ? 0.75 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--texto-muted)' }}>{horarioBRT} BRT</span>
        {travado
          ? <span title="Encerrado" style={{ fontSize: '0.8rem' }}>🔒</span>
          : preenchido && <span style={{ fontSize: '0.72rem', color: 'var(--verde)', fontWeight: 600 }}>✓ preenchido</span>
        }
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'right', fontSize: '0.9rem', lineHeight: 1.3 }}>
          <div><Flag cod={t1Cod} size={24} /></div>
          <div style={{ fontSize: '0.8rem' }}>{t1Nome}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {travado ? (
            <><div style={scoreBoxStyle}>{p.g1 ?? '–'}</div><span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span><div style={scoreBoxStyle}>{p.g2 ?? '–'}</div></>
          ) : (
            <>
              <input type="number" min="0" max="20" value={p.g1 ?? ''} onChange={(e) => setPlacar(jogoId, 'g1', e.target.value)} style={{ width: 44, textAlign: 'center', padding: '0.375rem' }} />
              <span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span>
              <input type="number" min="0" max="20" value={p.g2 ?? ''} onChange={(e) => setPlacar(jogoId, 'g2', e.target.value)} style={{ width: 44, textAlign: 'center', padding: '0.375rem' }} />
            </>
          )}
        </div>
        <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: 1.3 }}>
          <div><Flag cod={t2Cod} size={24} /></div>
          <div style={{ fontSize: '0.8rem' }}>{t2Nome}</div>
        </div>
      </div>
    </div>
  )
}

// ── Mata-Mata ───────────────────────────────────────────────

function MataMataFase({ fase, palpites, setPlacar, setTime, resolverTime, isLocked, podeEditarTimes, janela }) {
  if (!fase) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {fase.jogos.map((jogoId) => {
        const kickoff  = KICKOFF_MAP[jogoId]
        const horarioBRT = kickoff ? formatarHorarioBRT(kickoff) : ''
        const travado  = isLocked(jogoId)
        const editarTimes = podeEditarTimes(jogoId)
        const p        = palpites[jogoId] || {}
        const preenchido = p.g1 !== '' && p.g1 !== undefined && p.g2 !== '' && p.g2 !== undefined
        const t1       = resolverTime(jogoId, 't1')
        const t2       = resolverTime(jogoId, 't2')
        const labels   = BRACKET_LABELS[jogoId] || ['Time A', 'Time B']

        return (
          <MataMataMatchCard
            key={jogoId}
            jogoId={jogoId}
            t1={t1} t2={t2} labels={labels}
            palpite={p} preenchido={preenchido}
            travado={travado} editarTimes={editarTimes}
            horarioBRT={horarioBRT}
            setPlacar={setPlacar} setTime={setTime}
            janela={janela}
          />
        )
      })}
    </div>
  )
}

const BADGE = {
  inferido: { icon: '🔮', text: 'Inferido dos grupos', color: '#7c5ff5' },
  user:     { icon: '✏️', text: 'Seu palpite',          color: 'var(--verde)' },
  real:     { icon: '✅', text: 'Classificado real',    color: 'var(--sucesso)' },
  palpite:  { icon: '🔮', text: 'Seu palpite W1',       color: '#7c5ff5' },
  tbd:      null,
}

function EquipeCell({ cod, nome, label, origem, align, editarTimes, jogoId, lado, setTime }) {
  const badge = BADGE[origem]
  const isRight = align === 'right'

  const teamDisplay = cod ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', gap: '0.15rem' }}>
      <Flag cod={cod} size={24} />
      <div style={{ fontSize: '0.78rem', lineHeight: 1.2, textAlign: isRight ? 'right' : 'left' }}>{nome}</div>
    </div>
  ) : (
    <div style={{ fontSize: '0.75rem', color: 'var(--texto-muted)', textAlign: isRight ? 'right' : 'left', lineHeight: 1.3 }}>
      {label}
    </div>
  )

  if (!editarTimes) return teamDisplay

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', gap: '0.3rem' }}>
      {cod && <Flag cod={cod} size={20} />}
      <select
        value={cod || ''}
        onChange={(e) => setTime(jogoId, lado, e.target.value || undefined)}
        style={{
          padding: '0.25rem 0.35rem', fontSize: '0.75rem',
          background: 'var(--surface-2)', border: '1px solid var(--borda)',
          borderColor: badge?.color || 'var(--borda)',
          borderRadius: 6, color: 'var(--texto)', maxWidth: 110,
        }}
      >
        <option value="">{label}</option>
        {TIMES_ORDENADOS.map(([c, t]) => (
          <option key={c} value={c}>{t.nome}</option>
        ))}
      </select>
      {badge && (
        <div style={{ fontSize: '0.6rem', color: badge.color, fontWeight: 600 }}>
          {badge.icon} {badge.text}
        </div>
      )}
    </div>
  )
}

function MataMataMatchCard({ jogoId, t1, t2, labels, palpite: p, preenchido, travado, editarTimes, horarioBRT, setPlacar, setTime, janela }) {
  const t1Nome = t1.cod ? (TIMES[t1.cod]?.nome || t1.cod) : labels[0]
  const t2Nome = t2.cod ? (TIMES[t2.cod]?.nome || t2.cod) : labels[1]

  return (
    <div id={`jogo-${jogoId}`} className="card" style={{ padding: '0.75rem 1rem', borderColor: travado ? 'var(--borda)' : preenchido ? 'var(--verde-escuro)' : undefined, opacity: travado ? 0.75 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--texto-muted)' }}>
          {horarioBRT ? `${horarioBRT} BRT` : ''}
          {!t1.cod && !travado && <span style={{ color: 'var(--ouro)', marginLeft: 4 }}>· a definir</span>}
        </span>
        {travado
          ? <span title="Encerrado" style={{ fontSize: '0.8rem' }}>🔒</span>
          : preenchido && <span style={{ fontSize: '0.72rem', color: 'var(--verde)', fontWeight: 600 }}>✓ preenchido</span>
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'right' }}>
          <EquipeCell cod={t1.cod} nome={t1Nome} label={labels[0]} origem={t1.origem}
            align="right" editarTimes={editarTimes} jogoId={jogoId} lado="t1" setTime={setTime} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {travado ? (
            <><div style={scoreBoxStyle}>{p.g1 ?? '–'}</div><span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span><div style={scoreBoxStyle}>{p.g2 ?? '–'}</div></>
          ) : (
            <>
              <input type="number" min="0" max="20" value={p.g1 ?? ''} onChange={(e) => setPlacar(jogoId, 'g1', e.target.value)} style={{ width: 44, textAlign: 'center', padding: '0.375rem' }} />
              <span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span>
              <input type="number" min="0" max="20" value={p.g2 ?? ''} onChange={(e) => setPlacar(jogoId, 'g2', e.target.value)} style={{ width: 44, textAlign: 'center', padding: '0.375rem' }} />
            </>
          )}
        </div>

        <div style={{ textAlign: 'left' }}>
          <EquipeCell cod={t2.cod} nome={t2Nome} label={labels[1]} origem={t2.origem}
            align="left" editarTimes={editarTimes} jogoId={jogoId} lado="t2" setTime={setTime} />
        </div>
      </div>
    </div>
  )
}
