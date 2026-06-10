import { useRanking } from '../hooks/useRanking'

export default function Ranking({ slug }) {
  const { ranking, loading } = useRanking(slug)

  if (loading) return <div className="loading" style={{ minHeight: 200 }}><div className="loading-spinner" /></div>

  if (!ranking.length) return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--texto-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
      <p>O ranking aparecerá aqui quando houver resultados e palpites.</p>
    </div>
  )

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Ranking</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ranking.map((p, i) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderColor: i === 0 ? 'var(--ouro)' : undefined,
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: i < 3 ? ['var(--ouro)', '#C0C0C0', '#CD7F32'][i] : 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: i < 3 ? '#1a1a1a' : 'var(--texto-muted)',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--texto-muted)' }}>
                {p.exatos} placares exatos · {p.resultados} resultados
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--verde-claro)' }}>
              {p.pontos}
              <span style={{ fontSize: '0.75rem', color: 'var(--texto-muted)', fontWeight: 400 }}> pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
