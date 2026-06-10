import { GRUPOS, TIMES, gerarJogosGrupo } from '../lib/dados'

export default function Agenda() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Agenda — Fase de Grupos</h2>
      {Object.keys(GRUPOS).map((grupo) => {
        const jogos = gerarJogosGrupo(grupo)
        const times = GRUPOS[grupo].times
        return (
          <div key={grupo} style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--verde-claro)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              Grupo {grupo}
              {' — '}
              {times.map((t) => TIMES[t]?.bandeira || '🏳️').join(' ')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {jogos.map((jogo) => (
                <div key={jogo.id} className="card" style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: '0.95rem' }}>
                      <span>{TIMES[jogo.t1]?.bandeira || '🏳️'} {TIMES[jogo.t1]?.nome || jogo.t1}</span>
                    </div>
                    <div style={{
                      background: 'var(--surface-2)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      color: 'var(--texto-muted)',
                      minWidth: 50,
                      textAlign: 'center',
                    }}>
                      vs
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem' }}>
                      <span>{TIMES[jogo.t2]?.nome || jogo.t2} {TIMES[jogo.t2]?.bandeira || '🏳️'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--texto-muted)', marginTop: '0.25rem' }}>
                    Rodada {jogo.rodada} · Grupo {grupo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
