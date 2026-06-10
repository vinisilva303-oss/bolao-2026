// Gerador de payload Pix (padrão EMV/BR Code)
// Especificação: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf

function tlv(id, value) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

function sanitize(str, maxLen) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .substring(0, maxLen)
}

function crc16ccitt(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) : crc << 1
      crc &= 0xffff
    }
  }
  return crc
}

/**
 * Gera o payload do QR Code Pix estático.
 * @param {{ chave: string, nome: string, cidade?: string, valor?: number }} opts
 * @returns {string} payload completo com CRC
 */
export function gerarPixPayload({ chave, nome, cidade = 'SAO PAULO', valor }) {
  const nomeSan = sanitize(nome, 25)
  const cidadeSan = sanitize(cidade, 15)

  // Merchant Account Information (campo 26)
  const mai = tlv('00', 'br.gov.bcb.pix') + tlv('01', chave)

  // Additional Data Field (campo 62) — referência obrigatória
  const adf = tlv('05', '***')

  let payload = ''
  payload += tlv('00', '01')           // Payload Format Indicator
  payload += tlv('26', mai)            // Merchant Account Information (Pix)
  payload += tlv('52', '0000')         // Merchant Category Code
  payload += tlv('53', '986')          // Transaction Currency — BRL
  if (valor != null) payload += tlv('54', valor.toFixed(2)) // Transaction Amount
  payload += tlv('58', 'BR')           // Country Code
  payload += tlv('59', nomeSan)        // Merchant Name
  payload += tlv('60', cidadeSan)      // Merchant City
  payload += tlv('62', adf)            // Additional Data Field
  payload += '6304'                    // CRC placeholder (incluído no cálculo)

  const crc = crc16ccitt(payload)
  return payload + crc.toString(16).toUpperCase().padStart(4, '0')
}
