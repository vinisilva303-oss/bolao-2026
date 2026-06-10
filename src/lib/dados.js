// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Copa do Mundo 2026 — USA / Canada / México
// 48 seleções · 12 grupos (A–L) · 104 jogos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TIMES = {
  // CONMEBOL
  ARG: { nome: 'Argentina',  bandeira: '🇦🇷', conf: 'CONMEBOL' },
  BRA: { nome: 'Brasil',     bandeira: '🇧🇷', conf: 'CONMEBOL' },
  COL: { nome: 'Colômbia',   bandeira: '🇨🇴', conf: 'CONMEBOL' },
  ECU: { nome: 'Equador',    bandeira: '🇪🇨', conf: 'CONMEBOL' },
  URU: { nome: 'Uruguai',    bandeira: '🇺🇾', conf: 'CONMEBOL' },
  VEN: { nome: 'Venezuela',  bandeira: '🇻🇪', conf: 'CONMEBOL' },
  PAR: { nome: 'Paraguai',   bandeira: '🇵🇾', conf: 'CONMEBOL' },
  BOL: { nome: 'Bolívia',    bandeira: '🇧🇴', conf: 'CONMEBOL' },
  // UEFA
  FRA: { nome: 'França',     bandeira: '🇫🇷', conf: 'UEFA' },
  ESP: { nome: 'Espanha',    bandeira: '🇪🇸', conf: 'UEFA' },
  ENG: { nome: 'Inglaterra', bandeira: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', conf: 'UEFA' },
  ALE: { nome: 'Alemanha',   bandeira: '🇩🇪', conf: 'UEFA' },
  POR: { nome: 'Portugal',   bandeira: '🇵🇹', conf: 'UEFA' },
  HOL: { nome: 'Holanda',    bandeira: '🇳🇱', conf: 'UEFA' },
  BEL: { nome: 'Bélgica',    bandeira: '🇧🇪', conf: 'UEFA' },
  ITA: { nome: 'Itália',     bandeira: '🇮🇹', conf: 'UEFA' },
  SUI: { nome: 'Suíça',      bandeira: '🇨🇭', conf: 'UEFA' },
  CRO: { nome: 'Croácia',    bandeira: '🇭🇷', conf: 'UEFA' },
  DIN: { nome: 'Dinamarca',  bandeira: '🇩🇰', conf: 'UEFA' },
  AUT: { nome: 'Áustria',    bandeira: '🇦🇹', conf: 'UEFA' },
  SCO: { nome: 'Escócia',    bandeira: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', conf: 'UEFA' },
  SER: { nome: 'Sérvia',     bandeira: '🇷🇸', conf: 'UEFA' },
  POL: { nome: 'Polônia',    bandeira: '🇵🇱', conf: 'UEFA' },
  ROM: { nome: 'Romênia',    bandeira: '🇷🇴', conf: 'UEFA' },
  SLO: { nome: 'Eslovênia',  bandeira: '🇸🇮', conf: 'UEFA' },
  TUR: { nome: 'Turquia',    bandeira: '🇹🇷', conf: 'UEFA' },
  // CONCACAF
  USA: { nome: 'EUA',        bandeira: '🇺🇸', conf: 'CONCACAF' },
  MEX: { nome: 'México',     bandeira: '🇲🇽', conf: 'CONCACAF' },
  CAN: { nome: 'Canadá',     bandeira: '🇨🇦', conf: 'CONCACAF' },
  PAN: { nome: 'Panamá',     bandeira: '🇵🇦', conf: 'CONCACAF' },
  COS: { nome: 'Costa Rica', bandeira: '🇨🇷', conf: 'CONCACAF' },
  HON: { nome: 'Honduras',   bandeira: '🇭🇳', conf: 'CONCACAF' },
  // CAF
  MAR: { nome: 'Marrocos',   bandeira: '🇲🇦', conf: 'CAF' },
  SEN: { nome: 'Senegal',    bandeira: '🇸🇳', conf: 'CAF' },
  EGI: { nome: 'Egito',      bandeira: '🇪🇬', conf: 'CAF' },
  NIG: { nome: 'Nigéria',    bandeira: '🇳🇬', conf: 'CAF' },
  CMR: { nome: 'Camarões',   bandeira: '🇨🇲', conf: 'CAF' },
  GHA: { nome: 'Gana',       bandeira: '🇬🇭', conf: 'CAF' },
  MLI: { nome: 'Mali',       bandeira: '🇲🇱', conf: 'CAF' },
  RSA: { nome: 'África do Sul', bandeira: '🇿🇦', conf: 'CAF' },
  ALG: { nome: 'Argélia',    bandeira: '🇩🇿', conf: 'CAF' },
  // AFC
  JPN: { nome: 'Japão',      bandeira: '🇯🇵', conf: 'AFC' },
  KOR: { nome: 'Coreia do Sul', bandeira: '🇰🇷', conf: 'AFC' },
  AUS: { nome: 'Austrália',  bandeira: '🇦🇺', conf: 'AFC' },
  IRA: { nome: 'Irã',        bandeira: '🇮🇷', conf: 'AFC' },
  SAU: { nome: 'Arábia Saudita', bandeira: '🇸🇦', conf: 'AFC' },
  IRA2: { nome: 'Iraque',    bandeira: '🇮🇶', conf: 'AFC' },
  JOR: { nome: 'Jordânia',   bandeira: '🇯🇴', conf: 'AFC' },
  UZB: { nome: 'Uzbequistão', bandeira: '🇺🇿', conf: 'AFC' },
  // OFC
  NZL: { nome: 'Nova Zelândia', bandeira: '🇳🇿', conf: 'OFC' },
}

// ── Grupos ─────────────────────────────────────────────────
// ⚠️ Verifique os grupos no site da FIFA antes de publicar!
export const GRUPOS = {
  A: { times: ['MEX', 'ECU', 'HON', 'NZL'] },
  B: { times: ['ARG', 'CAN', 'CHI', 'ALG'] },   // CHI = placeholder
  C: { times: ['BRA', 'MAR', 'SEN', 'CRO'] },
  D: { times: ['FRA', 'PAN', 'AUS', 'SER'] },
  E: { times: ['ESP', 'TUR', 'RSA', 'KOR'] },
  F: { times: ['ENG', 'POR', 'COL', 'JPN'] },
  G: { times: ['ALE', 'COS', 'MLI', 'IRA'] },
  H: { times: ['HOL', 'USA', 'POL', 'UZB'] },
  I: { times: ['ITA', 'URU', 'GHA', 'SAU'] },
  J: { times: ['BEL', 'MEX', 'EGI', 'JOR'] },
  K: { times: ['POR', 'VEN', 'NIG', 'IRA2'] },
  L: { times: ['DIN', 'PAR', 'CMR', 'AUT'] },
}

// ── Jogos da Fase de Grupos ────────────────────────────────
// Formato ID: "A1" = jogo 1 do grupo A (times[0] vs times[1])
// Rodadas: R1=times[0]xT[1] e T[2]xT[3], R2=T[0]xT[2] e T[1]xT[3], R3=T[0]xT[3] e T[1]xT[2]
export function gerarJogosGrupo(grupoId) {
  const grupo = GRUPOS[grupoId]
  const [t1, t2, t3, t4] = grupo.times
  return [
    { id: `${grupoId}1`, t1, t2, rodada: 1 },
    { id: `${grupoId}2`, t1: t3, t2: t4, rodada: 1 },
    { id: `${grupoId}3`, t1, t2: t3, rodada: 2 },
    { id: `${grupoId}4`, t1: t2, t2: t4, rodada: 2 },
    { id: `${grupoId}5`, t1, t2: t4, rodada: 3 },
    { id: `${grupoId}6`, t1: t2, t2: t3, rodada: 3 },
  ]
}

export function getTodosJogosGrupos() {
  return Object.keys(GRUPOS).flatMap((g) => gerarJogosGrupo(g))
}

// ── Agenda completa (datas/horários a preencher) ───────────
// Preencha as datas reais ao confirmar a programação da FIFA.
// Horário de Brasília (UTC-3).
export const AGENDA_GRUPOS = getTodosJogosGrupos()

// ── Pontuação ──────────────────────────────────────────────
export const PONTOS = {
  PLACAR_EXATO: 3,
  RESULTADO_CERTO: 1,
  ERRO: 0,
}

export function calcularPontos(palpite, resultado) {
  if (!palpite || !resultado) return 0
  if (palpite.g1 === resultado.g1 && palpite.g2 === resultado.g2) return PONTOS.PLACAR_EXATO
  const vencedorPalpite = Math.sign(palpite.g1 - palpite.g2)
  const vencedorReal = Math.sign(resultado.g1 - resultado.g2)
  if (vencedorPalpite === vencedorReal) return PONTOS.RESULTADO_CERTO
  return PONTOS.ERRO
}

// ── Slug ──────────────────────────────────────────────────
export function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40)
}
