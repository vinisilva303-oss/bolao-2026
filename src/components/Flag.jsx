import { TIMES } from '../lib/dados'

// flagcdn.com só suporta larguras fixas: 20, 40, 80, 160, 320…
// Sempre buscamos w40 e deixamos o CSS controlar o tamanho exibido.
export default function Flag({ cod, size = 20 }) {
  const iso = cod ? TIMES[cod]?.iso : null
  if (!iso) {
    return (
      <span style={{ fontSize: size * 0.85, opacity: 0.45, lineHeight: 1, display: 'inline-block' }}>?</span>
    )
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      alt={TIMES[cod]?.nome || cod}
      style={{
        width: size,
        height: 'auto',
        borderRadius: 2,
        verticalAlign: 'middle',
        display: 'inline-block',
        flexShrink: 0,
      }}
      loading="lazy"
    />
  )
}
