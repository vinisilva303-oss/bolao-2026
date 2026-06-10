import { useState } from 'react'
import { AGENDA_GRUPOS, TIMES } from '../lib/dados'
import { salvarResultado, ouvirResultados } from '../lib/firestore'
import { useEffect } from 'react'

export default function AdminComponent({ slug, bolao }) {
  const [resultados, setResultados] = useState({})
  const [salvandoId, setSalvandoId] = useState(null)

  useEffect(() => {
    const unsub = ouvirResultados(slug, setResultados)
    return unsub
  }, [slug])

  async function handleSalvarResultado(jogoId, g1, g2) {
    if (bolao.plan !== 'pro') {
      alert('Apenas o plano Pro permite inserir resultados.')
      return
    }
    if (g1 === '' || g2 === '') return
    setSalvandoId(jogoId)
    try {
      await salvarResultado(slug, jogoId, Number(g1), Number(g2))
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar resultado.')
    } finally {
      setSalvandoId(null)
    }
  }

  const jogos = bolao.plan === 'pro' ? AGENDA_GRUPOS : AGENDA_GRUPOS.slice(0, 12)

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Resultados</h2>
      <p style={{ color: 'var(--texto-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        {bolao.plan === 'pro'
          ? 'Insira os placares reais após cada jogo. O ranking recalcula automaticamente.'
          : '⚠️ Upgrade para Pro para inserir resultados.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {jogos.map((jogo) => {
          const r = resultados[jogo.id] || {}
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
                    defaultValue={r.g1 ?? ''}
                    key={`${jogo.id}_g1_${r.g1}`}
                    disabled={bolao.plan !== 'pro'}
                    onChange={(e) => {
                      const g2Input = document.getElementById(`${jogo.id}_g2`)
                      if (g2Input) handleSalvarResultado(jogo.id, e.target.value, g2Input.value)
                    }}
                    style={{ width: 44, textAlign: 'center', padding: '0.375rem', opacity: bolao.plan !== 'pro' ? 0.5 : 1 }}
                  />
                  <span style={{ color: 'var(--texto-muted)', fontWeight: 700 }}>×</span>
                  <input
                    id={`${jogo.id}_g2`}
                    type="number"
                    min="0" max="20"
                    defaultValue={r.g2 ?? ''}
                    key={`${jogo.id}_g2_${r.g2}`}
                    disabled={bolao.plan !== 'pro'}
                    style={{ width: 44, textAlign: 'center', padding: '0.375rem', opacity: bolao.plan !== 'pro' ? 0.5 : 1 }}
                  />
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  {TIMES[jogo.t2]?.nome || jogo.t2} {TIMES[jogo.t2]?.bandeira}
                </div>
              </div>
              {salvandoId === jogo.id && (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--verde-claro)', marginTop: '0.25rem' }}>
                  Salvando...
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
