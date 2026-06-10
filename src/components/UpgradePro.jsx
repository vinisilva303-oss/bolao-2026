export default function UpgradePro({ slug }) {
  const adminWhatsapp = import.meta.env.VITE_ADMIN_WHATSAPP || '5511989366595'
  const mensagem = encodeURIComponent(
    `Olá! Acabei de pagar o Bolão Pro. Meu bolão: ${slug}. Segue o comprovante.`
  )
  const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${mensagem}`

  return (
    <div className="card" style={{ borderColor: 'var(--ouro)', background: 'rgba(245,166,35,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ color: 'var(--ouro)', marginBottom: '0.375rem' }}>⭐ Upgrade para Pro — R$ 29</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--texto-muted)', marginBottom: '1rem' }}>
            {['Participantes ilimitados', 'Inserir resultados reais', 'Ranking recalcula automático', 'Exportar ranking PDF'].map((item) => (
              <li key={item}>✅ {item}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ouro"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: 8, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}
            >
              📱 Enviar comprovante
            </a>
          </div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 140 }}>
          <div style={{
            background: 'var(--surface-2)',
            border: '2px solid var(--borda)',
            borderRadius: 12,
            padding: '1rem',
            fontSize: '0.8rem',
            color: 'var(--texto-muted)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📱</div>
            <div style={{ fontWeight: 600, color: 'var(--texto)', marginBottom: '0.25rem' }}>Pix · R$ 29</div>
            <div style={{ fontSize: '0.75rem' }}>QR Code disponível<br />em breve</div>
          </div>
        </div>
      </div>
      <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--texto-muted)' }}>
        Após o pagamento via Pix, envie o comprovante pelo WhatsApp. Ativamos seu plano Pro em minutos.
      </p>
    </div>
  )
}
