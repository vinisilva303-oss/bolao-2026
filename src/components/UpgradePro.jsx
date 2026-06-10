import QRCode from 'react-qr-code'
import { useState } from 'react'
import { gerarPixPayload } from '../lib/pix'

const PIX_CHAVE = import.meta.env.VITE_PIX_KEY
const PIX_NOME = import.meta.env.VITE_PIX_NAME
const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP
const VALOR = 29

export default function UpgradePro({ slug }) {
  const [copiado, setCopiado] = useState(false)

  const pixPayload = gerarPixPayload({
    chave: PIX_CHAVE,
    nome: PIX_NOME,
    cidade: 'SAO PAULO',
    valor: VALOR,
  })

  const mensagemWpp = encodeURIComponent(
    `Olá! Acabei de pagar o Bolão Pro (R$ 29). Meu bolão: ${slug}. Segue o comprovante.`
  )
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${mensagemWpp}`

  function copiarChave() {
    navigator.clipboard?.writeText(PIX_CHAVE).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    })
  }

  return (
    <div className="card" style={{ borderColor: 'var(--ouro)' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '2rem' }}>⭐</div>
        <div>
          <h3 style={{ color: 'var(--ouro)', marginBottom: '0.1rem' }}>Upgrade para Pro — R$ 29</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--texto-muted)' }}>Pagamento único por bolão · Sem assinatura</p>
        </div>
      </div>

      {/* Benefícios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          ['👥', 'Participantes ilimitados'],
          ['📊', 'Inserir resultados reais'],
          ['🏆', 'Ranking atualiza automático'],
          ['📄', 'Exportar ranking PDF'],
        ].map(([icone, texto]) => (
          <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--texto-muted)', background: 'var(--surface-2)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
            <span>{icone}</span> {texto}
          </div>
        ))}
      </div>

      {/* Layout Pix + instruções */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* QR Code */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ background: '#fff', padding: '12px', borderRadius: 12, display: 'inline-block' }}>
            <QRCode value={pixPayload} size={160} />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--texto-muted)' }}>
            Escaneie com o app do banco
          </div>
        </div>

        {/* Passo a passo */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontWeight: 600, marginBottom: '0.875rem', fontSize: '0.95rem' }}>Como pagar:</p>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--texto-muted)' }}>
            <li>Abra o app do seu banco e escaneie o QR Code <strong style={{ color: 'var(--texto)' }}>Pix ao lado</strong>.</li>
            <li>
              Ou copie a chave Pix abaixo:
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                <code style={{ background: 'var(--surface-2)', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {PIX_CHAVE}
                </code>
                <button
                  onClick={copiarChave}
                  style={{ background: copiado ? 'var(--sucesso)' : 'var(--surface-2)', border: '1px solid var(--borda)', color: copiado ? '#fff' : 'var(--texto-muted)', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {copiado ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </li>
            <li>Confirme o valor de <strong style={{ color: 'var(--ouro)' }}>R$ {VALOR},00</strong>.</li>
            <li>Envie o comprovante pelo WhatsApp. Ativamos em minutos!</li>
          </ol>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1.25rem',
              background: '#25D366',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar comprovante via WhatsApp
          </a>
        </div>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--texto-muted)', borderTop: '1px solid var(--borda)', paddingTop: '0.75rem' }}>
        Após confirmar o pagamento, ativamos o plano Pro manualmente em até 30 minutos durante o horário comercial.
      </p>
    </div>
  )
}
