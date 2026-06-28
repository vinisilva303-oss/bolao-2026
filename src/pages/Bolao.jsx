import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../App'
import { ouvirBolao, ouvirPalpites } from '../lib/firestore'
import { useNow } from '../lib/useNow'
import { GRUPOS, TIMES, BRACKET_LABELS, FASES_MATA_MATA, KICKOFF_MAP, gerarJogosGrupo, formatarHorarioBRT } from '../lib/dados'
import Agenda from '../components/Agenda'
import Palpites from '../components/Palpites'
import Ranking from '../components/Ranking'

const ABAS = ['Palpites', 'Ranking', 'Agenda']

export default function BolaoPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bolao, setBolao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('Palpites')
  const [palpites, setPalpites] = useState({})
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [focoJogoId, setFocoJogoId] = useState(null)

  const now = useNow(60000)

  function irParaPalpite(jogoId) {
    setFocoJogoId(jogoId)
    setAba('Palpites')
  }

  const isOwner = !!(user && bolao && user.uid === bolao.ownerId)

  // Jogos nas próximas 24h sem palpite completo (só para bolões jogo_a_jogo)
  const jogosAlerta = useMemo(() => {
    if (!bolao || bolao.tipo !== 'jogo_a_jogo' || !user) return []
    const limite = now + 24 * 60 * 60 * 1000
    const lista = []

    for (const [grupoId] of Object.entries(GRUPOS)) {
      for (const jogo of gerarJogosGrupo(grupoId)) {
        if (!jogo.kickoff) continue
        const ms = new Date(jogo.kickoff).getTime()
        if (ms <= now || ms > limite) continue
        const p = palpites[jogo.id]
        if (p && p.g1 !== '' && p.g1 !== undefined && p.g2 !== '' && p.g2 !== undefined) continue
        lista.push({ id: jogo.id, nome: `${TIMES[jogo.t1]?.nome || jogo.t1} × ${TIMES[jogo.t2]?.nome || jogo.t2}`, kickoff: jogo.kickoff })
      }
    }

    for (const fase of FASES_MATA_MATA) {
      for (const jogoId of fase.jogos) {
        const kickoff = KICKOFF_MAP[jogoId]
        if (!kickoff) continue
        const ms = new Date(kickoff).getTime()
        if (ms <= now || ms > limite) continue
        const p = palpites[jogoId]
        if (p && p.g1 !== '' && p.g1 !== undefined && p.g2 !== '' && p.g2 !== undefined) continue
        const labels = BRACKET_LABELS[jogoId] || ['Time A', 'Time B']
        lista.push({ id: jogoId, nome: `${labels[0]} × ${labels[1]}`, kickoff })
      }
    }

    return lista.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
  }, [bolao, palpites, now, user])

  useEffect(() => {
    return ouvirBolao(slug, (b) => { setBolao(b); setLoading(false) })
  }, [slug])

  useEffect(() => {
    if (!user) return
    return ouvirPalpites(slug, user.uid, setPalpites)
  }, [slug, user])

  function copiarLink() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2500)
    })
  }

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>

  if (!bolao) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🔍</div>
      <h2>Bolão não encontrado</h2>
      <p style={{ color: 'var(--texto-muted)' }}>O link pode estar errado ou o bolão foi removido.</p>
      <button className="btn-primario" onClick={() => navigate('/')}>Ir para o início</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid var(--borda)', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Nome + slug */}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bolao.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-muted)', fontFamily: 'monospace' }}>
              {window.location.hostname}/bolao/{slug}
            </div>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={copiarLink}
              className="btn-secundario"
              style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}
            >
              {linkCopiado ? '✓ Copiado!' : '📋 Copiar link'}
            </button>

            {isOwner && (
              <button
                className="btn-primario"
                style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}
                onClick={() => navigate(`/admin/${slug}`)}
              >
                ⚙️ Admin
              </button>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    title={user.displayName}
                    referrerPolicy="no-referrer"
                    style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--verde)' }}
                  />
                )}
                <button
                  className="btn-secundario"
                  style={{ padding: '0.3rem 0.625rem', fontSize: '0.78rem' }}
                  onClick={() => signOut(auth)}
                >
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Abas */}
      <div style={{ borderBottom: '1px solid var(--borda)', display: 'flex' }}>
        {ABAS.map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            style={{
              flex: 1, padding: '0.875rem',
              background: 'none', border: 'none',
              borderBottom: aba === a ? '2px solid var(--verde)' : '2px solid transparent',
              color: aba === a ? 'var(--verde-claro)' : 'var(--texto-muted)',
              fontWeight: aba === a ? 600 : 400,
              borderRadius: 0, cursor: 'pointer',
            }}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Banner de lembrete — jogo_a_jogo, próximas 24h, sem palpite */}
      {jogosAlerta.length > 0 && (
        <div style={{ background: '#92400e22', borderBottom: '1px solid #d97706', padding: '0.625rem 1rem' }}>
          <div className="container">
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fbbf24', marginBottom: '0.375rem' }}>
              ⚠️ {jogosAlerta.length === 1 ? '1 jogo começa' : `${jogosAlerta.length} jogos começam`} em menos de 24h sem palpite
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {jogosAlerta.map((j) => (
                <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--texto-muted)' }}>
                    {j.nome} · {formatarHorarioBRT(j.kickoff)} BRT
                  </span>
                  <button
                    onClick={() => irParaPalpite(j.id)}
                    style={{
                      padding: '0.2rem 0.625rem', borderRadius: 6, border: '1px solid #d97706',
                      background: 'transparent', color: '#fbbf24', fontSize: '0.78rem',
                      cursor: 'pointer', flexShrink: 0, fontWeight: 600,
                    }}
                  >
                    palpitar →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: '1rem' }}>
        <div className="container">
          {aba === 'Palpites' && <Palpites slug={slug} bolao={bolao} focoJogoId={focoJogoId} onFocoConsumido={() => setFocoJogoId(null)} />}
          {aba === 'Ranking'  && <Ranking slug={slug} />}
          {aba === 'Agenda'   && <Agenda onJogoClick={irParaPalpite} palpites={palpites} />}
        </div>
      </div>
    </div>
  )
}
