import { useState, useEffect } from 'react'
import { GRUPOS, TIMES, gerarJogosGrupo } from '../lib/dados'
import { salvarResultado, ouvirResultados } from '../lib/firestore'

export default function AdminComponent({ slug, bolao }) {
  const [resultados, setResultados] = useState({})
  const [edicao, setEdicao] = useState({})
  const [salvandoId, setSalvandoId] = useState(null)
  const [salvoId, setSalvoId] = useState(null)
  const [grupoAberto, setGrupoAberto] = useState('A')

  useEffect(() => {
    const unsub = ouvirResultados(slug, (r) => {
      setResultados(r)
      // Inicializa edição com valores existentes
      setEdicao((prev) => {
        const next = { ...prev }
        for (const [id, val] of Object.entries(r)) {
          if (!next[id]) next[id] = { g1: String(val.g1), g2: String(val.g2) }
        }
        return next
      })
    })
    return unsub
  }, [slug])

  function setValor(jogoId, lado, valor) {
    const num = parseInt(valor, 10)
    setEdicao((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [lado]: isNaN(num) ? '' : String(Math.max(0, Math.min(20, num))) },
    }))
  }

  async function salvar(jogoId) {
    const e = edicao[jogoId] || {}
    if (e.g1 === '' || e.g1 === undefined || e.g2 === '' || e.g2 === undefined) return
    setSalvandoId(jogoId)
    try {
      await salvarResultado(slug, jogoId, Number(e.g1), Number(e.g2))
      setSalvoId(jogoId)
      setTimeout(() => setSalvoId((prev) => (prev === jogoId ? null : prev)), 3000)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar resultado.')
    } finally {
      setSalvandoId(null)
    }
  }

  const isPro = bolao.plan === 'pro'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2>Resultados</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--texto-muted)' }}>
          {Object.keys(resultados).length} jogos salvos
        </span>
      </div>
      <p style={{ color: 'var(--texto-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        {isPro
          ? 'Insira o placar real após cada jogo. O ranking atualiza automaticamente.'
          : '⚠️ Faça upgrade para Pro para inserir resultados e atualizar o ranking.'}
      </p>

      {/* Seletor de grupo */}
      <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
        {Object.keys(GRUPOS).map((g) => {
          const jogosGrupo = gerarJogosGrupo(g)
          const salvos = jogosGrupo.filter((j) => resultados[j.id]).length
          return (
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
                position: 'relative',
              }}
            >
              {g}
              {salvos > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--sucesso)', color: '#fff',
                  borderRadius: '50%', width: 14, height: 14,
                  fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {salvos}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Jogos do grupo */}
      <GrupoResultados
        grupoId={grupoAberto}
        resultados={resultados}
        edicao={edicao}
        setValor={setValor}
        salvar={salvar}
        salvandoId={salvandoId}
        salvoId={salvoId}
        isPro={isPro}
      />
    </div>
  )
}

function GrupoResultados({ grupoId, resultados, edicao, setValor, salvar, salvandoId, salvoId, isPro }) {
  const jogos = gerarJogosGrupo(grupoId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {jogos.map((jogo) => {
        const e = edicao[jogo.id] || {}
        const salvo = resultados[jogo.id]
        const editado = salvo && (String(salvo.g1) !== e.g1 || String(salvo.g2) !== e.g2)
        const podeS = e.g1 !== '' && e.g1 !== undefined && e.g2 !== '' && e.g2 !== undefined

        return (
          <div
            key={jogo.id}
            className="card"
            style={{
              padding: '0.875rem 1rem',
              borderColor: salvoId === jogo.id ? 'var(--sucesso)' : salvo ? 'var(--verde-escuro)' : undefined,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: isPro ? '0.625rem' : 0 }}>
              <div style={{ textAlign: 'right', fontSize: '0.9rem', lineHeight: 1.3 }}>
                <div>{TIMES[jogo.t1]?.bandeira}</div>
                <div style={{ fontSize: '0.8rem' }}>{TIMES[jogo.t1]?.nome || jogo.t1}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <input
                  type="number" min="0" max="20"
                  value={e.g1 ?? ''}
                  onChange={(ev) => setValor(jogo.id, 'g1', ev.target.value)}
                  disabled={!isPro}
                  style={{ width: 44, textAlign: 'center', padding: '0.375rem', opacity: !isPro ? 0.4 : 1 }}
                />
                <span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span>
                <input
                  type="number" min="0" max="20"
                  value={e.g2 ?? ''}
                  onChange={(ev) => setValor(jogo.id, 'g2', ev.target.value)}
                  disabled={!isPro}
                  style={{ width: 44, textAlign: 'center', padding: '0.375rem', opacity: !isPro ? 0.4 : 1 }}
                />
              </div>
              <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: 1.3 }}>
                <div>{TIMES[jogo.t2]?.bandeira}</div>
                <div style={{ fontSize: '0.8rem' }}>{TIMES[jogo.t2]?.nome || jogo.t2}</div>
              </div>
            </div>

            {isPro && (
              <button
                onClick={() => salvar(jogo.id)}
                disabled={!podeS || salvandoId === jogo.id}
                style={{
                  width: '100%',
                  padding: '0.375rem',
                  fontSize: '0.8rem',
                  borderRadius: 6,
                  border: 'none',
                  cursor: podeS ? 'pointer' : 'not-allowed',
                  background: salvoId === jogo.id
                    ? 'var(--sucesso)'
                    : editado
                    ? 'var(--ouro)'
                    : salvo
                    ? 'var(--surface-2)'
                    : 'var(--verde)',
                  color: editado ? '#1a1a1a' : '#fff',
                  fontWeight: 600,
                  opacity: !podeS ? 0.5 : 1,
                }}
              >
                {salvandoId === jogo.id
                  ? 'Salvando...'
                  : salvoId === jogo.id
                  ? '✅ Salvo!'
                  : editado
                  ? '💾 Atualizar'
                  : salvo
                  ? `✓ ${salvo.g1} × ${salvo.g2}`
                  : 'Salvar resultado'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
