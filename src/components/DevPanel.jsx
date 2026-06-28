import { useState, useEffect } from 'react'
import { simTime } from '../lib/simTime'
import { formatarHorarioBRT } from '../lib/dados'

// Momentos-chave da Copa 2026 para simulação rápida
const MOMENTOS = [
  {
    grupo: 'Antes da Copa',
    items: [
      { label: '10/06 — Véspera (palpitar tudo)', iso: '2026-06-10T20:00:00Z' },
    ],
  },
  {
    grupo: 'Rodada 1',
    items: [
      { label: '11/06 19:01 — Após A1 MEX×RSA', iso: '2026-06-11T19:01:00Z' },
      { label: '13/06 22:01 — Após BRA×MAR (C1)', iso: '2026-06-13T22:01:00Z' },
      { label: '14/06 04:01 — Após AUS×TUR (D2)', iso: '2026-06-14T04:01:00Z' },
      { label: '18/06 02:01 — R1 toda encerrada', iso: '2026-06-18T02:01:00Z' },
    ],
  },
  {
    grupo: 'Rodada 2',
    items: [
      { label: '18/06 16:01 — R2 começa', iso: '2026-06-18T16:01:00Z' },
      { label: '20/06 20:01 — Após ALE×CIV (E3)', iso: '2026-06-20T20:01:00Z' },
      { label: '24/06 02:01 — R2 toda encerrada', iso: '2026-06-24T02:01:00Z' },
    ],
  },
  {
    grupo: 'Rodada 3 (simultânea)',
    items: [
      { label: '24/06 19:01 — R3 começa (B5/B6)', iso: '2026-06-24T19:01:00Z' },
      { label: '24/06 22:01 — Após BRA×SCO (C5)', iso: '2026-06-24T22:01:00Z' },
      { label: '26/06 03:01 — Após BEL×NZL (G5)', iso: '2026-06-27T03:01:00Z' },
      { label: '28/06 02:01 — Grupos encerrados', iso: '2026-06-28T02:01:00Z' },
    ],
  },
  {
    grupo: 'Rodada de 32',
    items: [
      { label: '01/07 16:01 — R32 começa', iso: '2026-07-01T16:01:00Z' },
      { label: '03/07 02:01 — R32 metade', iso: '2026-07-03T02:01:00Z' },
      { label: '05/07 02:01 — R32 encerrada', iso: '2026-07-05T02:01:00Z' },
    ],
  },
  {
    grupo: 'Oitavas / Quartas / Semi',
    items: [
      { label: '06/07 19:01 — Oitavas começa', iso: '2026-07-06T19:01:00Z' },
      { label: '10/07 02:01 — Oitavas encerradas', iso: '2026-07-10T02:01:00Z' },
      { label: '11/07 19:01 — Quartas começa', iso: '2026-07-11T19:01:00Z' },
      { label: '13/07 02:01 — Quartas encerradas', iso: '2026-07-13T02:01:00Z' },
      { label: '15/07 22:01 — Semifinais começa', iso: '2026-07-15T22:01:00Z' },
      { label: '17/07 02:01 — Semifinais encerradas', iso: '2026-07-17T02:01:00Z' },
    ],
  },
  {
    grupo: 'Final',
    items: [
      { label: '18/07 19:01 — 3º lugar', iso: '2026-07-18T19:01:00Z' },
      { label: '19/07 22:01 — Final!', iso: '2026-07-19T22:01:00Z' },
      { label: '20/07 02:01 — Copa encerrada', iso: '2026-07-20T02:01:00Z' },
    ],
  },
]

export default function DevPanel() {
  const [aberto, setAberto] = useState(false)
  const [nowSim, setNowSim] = useState(() => simTime.get())
  const [customISO, setCustomISO] = useState('')

  useEffect(() => {
    const update = () => setNowSim(simTime.get())
    window.addEventListener('simtime', update)
    return () => window.removeEventListener('simtime', update)
  }, [])

  function aplicar(isoUtc) {
    simTime.set(new Date(isoUtc).getTime())
  }

  function aplicarCustom(e) {
    e.preventDefault()
    if (!customISO) return
    // Input datetime-local é no fuso do browser; converte para UTC
    const ms = new Date(customISO).getTime()
    if (!isNaN(ms)) simTime.set(ms)
  }

  function limpar() {
    simTime.clear()
  }

  const horarioAtual = nowSim
    ? formatarHorarioBRT(new Date(nowSim).toISOString()) + ' BRT (simulado)'
    : 'Tempo real — ' + formatarHorarioBRT(new Date().toISOString()) + ' BRT'

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem',
    }}>
      {aberto && (
        <div style={{
          background: '#1a1a2e', border: '2px solid #f59e0b',
          borderRadius: 12, padding: '1rem', width: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          maxHeight: '80vh', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.85rem' }}>🛠 PAINEL DE SIMULAÇÃO</span>
            <button
              onClick={() => setAberto(false)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
            >✕</button>
          </div>

          {/* Tempo atual */}
          <div style={{
            background: '#111', borderRadius: 8, padding: '0.5rem 0.75rem',
            marginBottom: '0.875rem', fontSize: '0.78rem',
            color: nowSim ? '#f59e0b' : '#6ee7b7',
            fontFamily: 'monospace',
          }}>
            ⏱ {horarioAtual}
          </div>

          {/* Tempo customizado */}
          <form onSubmit={aplicarCustom} style={{ marginBottom: '0.875rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.3rem' }}>Horário customizado (no seu fuso):</div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <input
                type="datetime-local"
                value={customISO}
                onChange={(e) => setCustomISO(e.target.value)}
                style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.78rem', background: '#111', border: '1px solid #444', borderRadius: 6, color: '#fff' }}
              />
              <button type="submit" style={{ padding: '0.3rem 0.625rem', background: '#f59e0b', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', color: '#000' }}>
                Ir
              </button>
            </div>
          </form>

          {/* Presets */}
          {MOMENTOS.map((grupo) => (
            <div key={grupo.grupo} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                {grupo.grupo}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {grupo.items.map((item) => {
                  const ativo = nowSim && Math.abs(nowSim - new Date(item.iso).getTime()) < 120000
                  return (
                    <button
                      key={item.iso}
                      onClick={() => aplicar(item.iso)}
                      style={{
                        textAlign: 'left', padding: '0.3rem 0.625rem',
                        background: ativo ? '#f59e0b22' : '#111',
                        border: `1px solid ${ativo ? '#f59e0b' : '#333'}`,
                        borderRadius: 6, color: ativo ? '#f59e0b' : '#ccc',
                        fontSize: '0.75rem', cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Botão limpar */}
          {nowSim && (
            <button
              onClick={limpar}
              style={{
                width: '100%', padding: '0.4rem',
                background: '#ef444422', border: '1px solid #ef4444',
                borderRadius: 6, color: '#ef4444',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem',
              }}
            >
              ⏱ Voltar ao tempo real
            </button>
          )}
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setAberto((v) => !v)}
        title="Painel de simulação (só em DEV)"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: nowSim ? '#f59e0b' : '#1a1a2e',
          border: `2px solid ${nowSim ? '#f59e0b' : '#444'}`,
          color: nowSim ? '#000' : '#f59e0b',
          fontSize: '1.1rem', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        🛠
      </button>
    </div>
  )
}
