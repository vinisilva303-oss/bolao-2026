// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Copa do Mundo 2026 — USA / Canada / México
// 48 seleções · 12 grupos (A–L) · 104 jogos
// Grupos e jogos conforme programação oficial FIFA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TIMES = {
  // CONMEBOL
  ARG: { nome: 'Argentina',       iso: 'ar', conf: 'CONMEBOL' },
  BRA: { nome: 'Brasil',          iso: 'br', conf: 'CONMEBOL' },
  COL: { nome: 'Colômbia',        iso: 'co', conf: 'CONMEBOL' },
  ECU: { nome: 'Equador',         iso: 'ec', conf: 'CONMEBOL' },
  URU: { nome: 'Uruguai',         iso: 'uy', conf: 'CONMEBOL' },
  PAR: { nome: 'Paraguai',        iso: 'py', conf: 'CONMEBOL' },
  // UEFA
  ALE: { nome: 'Alemanha',        iso: 'de', conf: 'UEFA' },
  AUT: { nome: 'Áustria',         iso: 'at', conf: 'UEFA' },
  BEL: { nome: 'Bélgica',         iso: 'be', conf: 'UEFA' },
  BIH: { nome: 'Bósnia-Herz.',    iso: 'ba', conf: 'UEFA' },
  CRO: { nome: 'Croácia',         iso: 'hr', conf: 'UEFA' },
  CZE: { nome: 'Rep. Tcheca',     iso: 'cz', conf: 'UEFA' },
  ENG: { nome: 'Inglaterra',      iso: 'gb-eng', conf: 'UEFA' },
  ESP: { nome: 'Espanha',         iso: 'es', conf: 'UEFA' },
  FRA: { nome: 'França',          iso: 'fr', conf: 'UEFA' },
  HOL: { nome: 'Holanda',         iso: 'nl', conf: 'UEFA' },
  NOR: { nome: 'Noruega',         iso: 'no', conf: 'UEFA' },
  POR: { nome: 'Portugal',        iso: 'pt', conf: 'UEFA' },
  SCO: { nome: 'Escócia',         iso: 'gb-sct', conf: 'UEFA' },
  SUI: { nome: 'Suíça',           iso: 'ch', conf: 'UEFA' },
  SWE: { nome: 'Suécia',          iso: 'se', conf: 'UEFA' },
  TUR: { nome: 'Turquia',         iso: 'tr', conf: 'UEFA' },
  // CONCACAF
  CAN: { nome: 'Canadá',          iso: 'ca', conf: 'CONCACAF' },
  CUR: { nome: 'Curaçao',         iso: 'cw', conf: 'CONCACAF' },
  HAI: { nome: 'Haiti',           iso: 'ht', conf: 'CONCACAF' },
  MEX: { nome: 'México',          iso: 'mx', conf: 'CONCACAF' },
  PAN: { nome: 'Panamá',          iso: 'pa', conf: 'CONCACAF' },
  USA: { nome: 'EUA',             iso: 'us', conf: 'CONCACAF' },
  // CAF
  ALG: { nome: 'Argélia',         iso: 'dz', conf: 'CAF' },
  CGO: { nome: 'RD Congo',        iso: 'cd', conf: 'CAF' },
  CIV: { nome: 'Costa do Marfim', iso: 'ci', conf: 'CAF' },
  CPV: { nome: 'Cabo Verde',      iso: 'cv', conf: 'CAF' },
  EGI: { nome: 'Egito',           iso: 'eg', conf: 'CAF' },
  GHA: { nome: 'Gana',            iso: 'gh', conf: 'CAF' },
  MAR: { nome: 'Marrocos',        iso: 'ma', conf: 'CAF' },
  RSA: { nome: 'África do Sul',   iso: 'za', conf: 'CAF' },
  SEN: { nome: 'Senegal',         iso: 'sn', conf: 'CAF' },
  TUN: { nome: 'Tunísia',         iso: 'tn', conf: 'CAF' },
  // AFC
  AUS: { nome: 'Austrália',       iso: 'au', conf: 'AFC' },
  IRA: { nome: 'Irã',             iso: 'ir', conf: 'AFC' },
  IRA2: { nome: 'Iraque',         iso: 'iq', conf: 'AFC' },
  JOR: { nome: 'Jordânia',        iso: 'jo', conf: 'AFC' },
  JPN: { nome: 'Japão',           iso: 'jp', conf: 'AFC' },
  KOR: { nome: 'Coreia do Sul',   iso: 'kr', conf: 'AFC' },
  QAT: { nome: 'Catar',           iso: 'qa', conf: 'AFC' },
  SAU: { nome: 'Arábia Saudita',  iso: 'sa', conf: 'AFC' },
  UZB: { nome: 'Uzbequistão',     iso: 'uz', conf: 'AFC' },
  // OFC
  NZL: { nome: 'Nova Zelândia',   iso: 'nz', conf: 'OFC' },
}

// ── Grupos ─────────────────────────────────────────────────
// Ordem dos times: [t1, t2, t3, t4]
// Jogos gerados: R1=t1×t2 e t3×t4 | R2=t1×t3 e t2×t4 | R3=t1×t4 e t2×t3
export const GRUPOS = {
  A: { times: ['MEX', 'RSA', 'KOR', 'CZE'] },
  B: { times: ['CAN', 'BIH', 'QAT', 'SUI'] },
  C: { times: ['BRA', 'MAR', 'HAI', 'SCO'] },
  D: { times: ['USA', 'PAR', 'AUS', 'TUR'] },
  E: { times: ['ALE', 'CUR', 'CIV', 'ECU'] },
  F: { times: ['HOL', 'JPN', 'SWE', 'TUN'] },
  G: { times: ['BEL', 'EGI', 'IRA', 'NZL'] },
  H: { times: ['ESP', 'CPV', 'SAU', 'URU'] },
  I: { times: ['FRA', 'SEN', 'IRA2', 'NOR'] },
  J: { times: ['ARG', 'ALG', 'AUT', 'JOR'] },
  K: { times: ['POR', 'CGO', 'UZB', 'COL'] },
  L: { times: ['ENG', 'CRO', 'GHA', 'PAN'] },
}

// ── Horários de início dos jogos (UTC ISO) ─────────────────
// Fonte: openfootball/worldcup — horários locais convertidos para UTC
// Lock: cada jogo trava individualmente no seu kickoff (comparar com new Date())
// Para exibir em BRT use formatarHorarioBRT(kickoff)
export const KICKOFF_MAP = {
  // Grupo A — MEX RSA KOR CZE
  A1: '2026-06-11T19:00:00Z', // MEX × RSA  — 16:00 BRT
  A2: '2026-06-12T02:00:00Z', // KOR × CZE  — 23:00 BRT 11/06
  A3: '2026-06-19T01:00:00Z', // MEX × KOR  — 22:00 BRT 18/06
  A4: '2026-06-18T16:00:00Z', // RSA × CZE  — 13:00 BRT
  A5: '2026-06-25T01:00:00Z', // MEX × CZE  — 22:00 BRT 24/06
  A6: '2026-06-25T01:00:00Z', // RSA × KOR  — 22:00 BRT 24/06
  // Grupo B — CAN BIH QAT SUI
  B1: '2026-06-12T19:00:00Z', // CAN × BIH  — 16:00 BRT
  B2: '2026-06-13T19:00:00Z', // QAT × SUI  — 16:00 BRT
  B3: '2026-06-18T22:00:00Z', // CAN × QAT  — 19:00 BRT
  B4: '2026-06-18T19:00:00Z', // BIH × SUI  — 16:00 BRT
  B5: '2026-06-24T19:00:00Z', // CAN × SUI  — 16:00 BRT
  B6: '2026-06-24T19:00:00Z', // BIH × QAT  — 16:00 BRT
  // Grupo C — BRA MAR HAI SCO
  C1: '2026-06-13T22:00:00Z', // BRA × MAR  — 19:00 BRT
  C2: '2026-06-14T01:00:00Z', // HAI × SCO  — 22:00 BRT 13/06
  C3: '2026-06-20T00:30:00Z', // BRA × HAI  — 21:30 BRT 19/06
  C4: '2026-06-19T22:00:00Z', // MAR × SCO  — 19:00 BRT
  C5: '2026-06-24T22:00:00Z', // BRA × SCO  — 19:00 BRT
  C6: '2026-06-24T22:00:00Z', // MAR × HAI  — 19:00 BRT
  // Grupo D — USA PAR AUS TUR
  D1: '2026-06-13T01:00:00Z', // USA × PAR  — 22:00 BRT 12/06
  D2: '2026-06-14T04:00:00Z', // AUS × TUR  — 01:00 BRT 14/06
  D3: '2026-06-19T19:00:00Z', // USA × AUS  — 16:00 BRT
  D4: '2026-06-20T03:00:00Z', // PAR × TUR  — 00:00 BRT 20/06
  D5: '2026-06-26T02:00:00Z', // USA × TUR  — 23:00 BRT 25/06
  D6: '2026-06-26T02:00:00Z', // PAR × AUS  — 23:00 BRT 25/06
  // Grupo E — ALE CUR CIV ECU
  E1: '2026-06-14T17:00:00Z', // ALE × CUR  — 14:00 BRT
  E2: '2026-06-14T23:00:00Z', // CIV × ECU  — 20:00 BRT
  E3: '2026-06-20T20:00:00Z', // ALE × CIV  — 17:00 BRT
  E4: '2026-06-21T00:00:00Z', // CUR × ECU  — 21:00 BRT 20/06
  E5: '2026-06-25T20:00:00Z', // ALE × ECU  — 17:00 BRT
  E6: '2026-06-25T20:00:00Z', // CUR × CIV  — 17:00 BRT
  // Grupo F — HOL JPN SWE TUN
  F1: '2026-06-14T20:00:00Z', // HOL × JPN  — 17:00 BRT
  F2: '2026-06-15T02:00:00Z', // SWE × TUN  — 23:00 BRT 14/06
  F3: '2026-06-20T17:00:00Z', // HOL × SWE  — 14:00 BRT
  F4: '2026-06-21T04:00:00Z', // JPN × TUN  — 01:00 BRT 21/06
  F5: '2026-06-25T23:00:00Z', // HOL × TUN  — 20:00 BRT
  F6: '2026-06-25T23:00:00Z', // JPN × SWE  — 20:00 BRT
  // Grupo G — BEL EGI IRA NZL
  G1: '2026-06-15T19:00:00Z', // BEL × EGI  — 16:00 BRT
  G2: '2026-06-16T01:00:00Z', // IRA × NZL  — 22:00 BRT 15/06
  G3: '2026-06-21T19:00:00Z', // BEL × IRA  — 16:00 BRT
  G4: '2026-06-22T01:00:00Z', // EGI × NZL  — 22:00 BRT 21/06
  G5: '2026-06-27T03:00:00Z', // BEL × NZL  — 00:00 BRT 27/06
  G6: '2026-06-27T03:00:00Z', // EGI × IRA  — 00:00 BRT 27/06
  // Grupo H — ESP CPV SAU URU
  H1: '2026-06-15T16:00:00Z', // ESP × CPV  — 13:00 BRT
  H2: '2026-06-15T22:00:00Z', // SAU × URU  — 19:00 BRT
  H3: '2026-06-21T16:00:00Z', // ESP × SAU  — 13:00 BRT
  H4: '2026-06-21T22:00:00Z', // CPV × URU  — 19:00 BRT
  H5: '2026-06-27T00:00:00Z', // ESP × URU  — 21:00 BRT 26/06
  H6: '2026-06-27T00:00:00Z', // CPV × SAU  — 21:00 BRT 26/06
  // Grupo I — FRA SEN IRA2 NOR
  I1: '2026-06-16T19:00:00Z', // FRA × SEN  — 16:00 BRT
  I2: '2026-06-16T22:00:00Z', // IRA2 × NOR — 19:00 BRT
  I3: '2026-06-22T21:00:00Z', // FRA × IRA2 — 18:00 BRT
  I4: '2026-06-23T00:00:00Z', // SEN × NOR  — 21:00 BRT 22/06
  I5: '2026-06-26T19:00:00Z', // FRA × NOR  — 16:00 BRT
  I6: '2026-06-26T19:00:00Z', // SEN × IRA2 — 16:00 BRT
  // Grupo J — ARG ALG AUT JOR
  J1: '2026-06-17T01:00:00Z', // ARG × ALG  — 22:00 BRT 16/06
  J2: '2026-06-17T04:00:00Z', // AUT × JOR  — 01:00 BRT 17/06
  J3: '2026-06-22T17:00:00Z', // ARG × AUT  — 14:00 BRT
  J4: '2026-06-23T03:00:00Z', // ALG × JOR  — 00:00 BRT 23/06
  J5: '2026-06-28T02:00:00Z', // ARG × JOR  — 23:00 BRT 27/06
  J6: '2026-06-28T02:00:00Z', // ALG × AUT  — 23:00 BRT 27/06
  // Grupo K — POR CGO UZB COL
  K1: '2026-06-17T17:00:00Z', // POR × CGO  — 14:00 BRT
  K2: '2026-06-18T02:00:00Z', // UZB × COL  — 23:00 BRT 17/06
  K3: '2026-06-23T17:00:00Z', // POR × UZB  — 14:00 BRT
  K4: '2026-06-24T02:00:00Z', // CGO × COL  — 23:00 BRT 23/06
  K5: '2026-06-27T23:30:00Z', // POR × COL  — 20:30 BRT
  K6: '2026-06-27T23:30:00Z', // CGO × UZB  — 20:30 BRT
  // Grupo L — ENG CRO GHA PAN
  L1: '2026-06-17T20:00:00Z', // ENG × CRO  — 17:00 BRT
  L2: '2026-06-17T23:00:00Z', // GHA × PAN  — 20:00 BRT
  L3: '2026-06-23T20:00:00Z', // ENG × GHA  — 17:00 BRT
  L4: '2026-06-23T23:00:00Z', // CRO × PAN  — 20:00 BRT
  L5: '2026-06-27T21:00:00Z', // ENG × PAN  — 18:00 BRT
  L6: '2026-06-27T21:00:00Z', // CRO × GHA  — 18:00 BRT
  // ── Mata-Mata ──────────────────────────────────────────────
  // Rodada de 32 (28 Jun–04 Jul) — horários confirmados FIFA
  R32_01: '2026-06-28T19:00:00Z', // RSA × CAN  — 16:00 BRT
  R32_02: '2026-06-29T17:00:00Z', // BRA × JPN  — 14:00 BRT
  R32_03: '2026-06-29T20:30:00Z', // ALE × PAR  — 17:30 BRT
  R32_04: '2026-06-30T01:00:00Z', // HOL × MAR  — 22:00 BRT 29/06
  R32_05: '2026-06-30T17:00:00Z', // CIV × NOR  — 14:00 BRT
  R32_06: '2026-06-30T21:00:00Z', // FRA × SWE  — 18:00 BRT
  R32_07: '2026-07-01T01:00:00Z', // MEX × ECU  — 22:00 BRT 30/06
  R32_08: '2026-07-01T16:00:00Z', // ENG × CGO  — 13:00 BRT
  R32_09: '2026-07-01T20:00:00Z', // BEL × SEN  — 17:00 BRT
  R32_10: '2026-07-02T00:00:00Z', // USA × BIH  — 21:00 BRT 01/07
  R32_11: '2026-07-02T19:00:00Z', // ESP × AUT  — 16:00 BRT
  R32_12: '2026-07-02T23:00:00Z', // POR × CRO  — 20:00 BRT
  R32_13: '2026-07-03T03:00:00Z', // SUI × ALG  — 00:00 BRT 03/07
  R32_14: '2026-07-03T20:00:00Z', // AUS × EGI  — 17:00 BRT
  R32_15: '2026-07-04T01:30:00Z', // COL × GHA  — 22:30 BRT 03/07
  R32_16: '2026-07-04T02:00:00Z', // ARG × CPV  — 23:00 BRT 03/07
  // Oitavas de Final (06–09 Jul): 8 jogos, 2 por dia
  R16_01: '2026-07-06T20:00:00Z', // 17:00 BRT
  R16_02: '2026-07-06T23:00:00Z', // 20:00 BRT
  R16_03: '2026-07-07T20:00:00Z', // 17:00 BRT
  R16_04: '2026-07-07T23:00:00Z', // 20:00 BRT
  R16_05: '2026-07-08T20:00:00Z', // 17:00 BRT
  R16_06: '2026-07-08T23:00:00Z', // 20:00 BRT
  R16_07: '2026-07-09T20:00:00Z', // 17:00 BRT
  R16_08: '2026-07-09T23:00:00Z', // 20:00 BRT
  // Quartas de Final (11–12 Jul): 4 jogos, 2 por dia
  QF_1: '2026-07-11T20:00:00Z',  // 17:00 BRT
  QF_2: '2026-07-11T23:00:00Z',  // 20:00 BRT
  QF_3: '2026-07-12T20:00:00Z',  // 17:00 BRT
  QF_4: '2026-07-12T23:00:00Z',  // 20:00 BRT
  // Semifinais (15–16 Jul): 1 jogo por dia
  SF_1: '2026-07-15T23:00:00Z',  // 20:00 BRT
  SF_2: '2026-07-16T23:00:00Z',  // 20:00 BRT
  // Terceiro Lugar + Final
  '3RD': '2026-07-18T20:00:00Z', // 17:00 BRT
  FIN:   '2026-07-19T23:00:00Z', // 20:00 BRT
}

// ── Jogos da Fase de Grupos ────────────────────────────────
// Formato ID: "A1" = jogo 1 do grupo A (times[0] vs times[1])
// R1: t1×t2, t3×t4 | R2: t1×t3, t2×t4 | R3: t1×t4, t2×t3
export function gerarJogosGrupo(grupoId) {
  const grupo = GRUPOS[grupoId]
  const [t1, t2, t3, t4] = grupo.times
  const k = (n) => KICKOFF_MAP[`${grupoId}${n}`]
  return [
    { id: `${grupoId}1`, t1, t2, rodada: 1, kickoff: k(1) },
    { id: `${grupoId}2`, t1: t3, t2: t4, rodada: 1, kickoff: k(2) },
    { id: `${grupoId}3`, t1, t2: t3, rodada: 2, kickoff: k(3) },
    { id: `${grupoId}4`, t1: t2, t2: t4, rodada: 2, kickoff: k(4) },
    { id: `${grupoId}5`, t1, t2: t4, rodada: 3, kickoff: k(5) },
    { id: `${grupoId}6`, t1: t2, t2: t3, rodada: 3, kickoff: k(6) },
  ]
}

// ── Mata-Mata ──────────────────────────────────────────────
export const FASES_MATA_MATA = [
  { id: 'R32', nome: 'Rodada de 32',   jogos: ['R32_01','R32_02','R32_03','R32_04','R32_05','R32_06','R32_07','R32_08','R32_09','R32_10','R32_11','R32_12','R32_13','R32_14','R32_15','R32_16'] },
  { id: 'R16', nome: 'Oitavas',        jogos: ['R16_01','R16_02','R16_03','R16_04','R16_05','R16_06','R16_07','R16_08'] },
  { id: 'QF',  nome: 'Quartas',        jogos: ['QF_1','QF_2','QF_3','QF_4'] },
  { id: 'SF',  nome: 'Semifinais',     jogos: ['SF_1','SF_2'] },
  { id: 'FIN', nome: 'Final',          jogos: ['3RD','FIN'] },
]

// Labels do chaveamento exibidos enquanto os times são TBD
// O admin define os times reais no Firestore após os grupos
export const BRACKET_LABELS = {
  R32_01: ['África do Sul', 'Canadá'],       // 2ºA × 2ºB
  R32_02: ['Brasil', 'Japão'],               // 1ºC × 2ºF
  R32_03: ['Alemanha', 'Paraguai'],          // 1ºE × 3ºD
  R32_04: ['Holanda', 'Marrocos'],           // 1ºF × 2ºC
  R32_05: ['Costa do Marfim', 'Noruega'],   // 2ºE × 2ºI
  R32_06: ['França', 'Suécia'],             // 1ºI × 3ºF
  R32_07: ['México', 'Equador'],            // 1ºA × 3ºE
  R32_08: ['Inglaterra', 'RD Congo'],       // 1ºL × 3ºK
  R32_09: ['Bélgica', 'Senegal'],           // 1ºG × 3ºI
  R32_10: ['EUA', 'Bósnia-Herz.'],         // 1ºD × 3ºB
  R32_11: ['Espanha', 'Áustria'],           // 1ºH × 2ºJ
  R32_12: ['Portugal', 'Croácia'],          // 2ºK × 2ºL
  R32_13: ['Suíça', 'Argélia'],            // 1ºB × 3ºJ
  R32_14: ['Austrália', 'Egito'],           // 2ºD × 2ºG
  R32_15: ['Colômbia', 'Gana'],            // 1ºK × 3ºL
  R32_16: ['Argentina', 'Cabo Verde'],      // 1ºJ × 2ºH
  R16_01: ['Venc. R32_01', 'Venc. R32_02'], R16_02: ['Venc. R32_03', 'Venc. R32_04'],
  R16_03: ['Venc. R32_05', 'Venc. R32_06'], R16_04: ['Venc. R32_07', 'Venc. R32_08'],
  R16_05: ['Venc. R32_09', 'Venc. R32_10'], R16_06: ['Venc. R32_11', 'Venc. R32_12'],
  R16_07: ['Venc. R32_13', 'Venc. R32_14'], R16_08: ['Venc. R32_15', 'Venc. R32_16'],
  QF_1: ['Venc. R16_01', 'Venc. R16_02'], QF_2: ['Venc. R16_03', 'Venc. R16_04'],
  QF_3: ['Venc. R16_05', 'Venc. R16_06'], QF_4: ['Venc. R16_07', 'Venc. R16_08'],
  SF_1: ['Venc. QF_1', 'Venc. QF_2'],     SF_2: ['Venc. QF_3', 'Venc. QF_4'],
  '3RD': ['Perd. SF_1', 'Perd. SF_2'],    FIN:  ['Venc. SF_1', 'Venc. SF_2'],
}

// ── Cenário "Palpite Antecipado" — janelas de tempo ────────
// Janela 1: antes do primeiro jogo (grupos editáveis, mata-mata editável com inferência)
// Janela 2: grupos → R32 start (grupos travados, mata-mata editável com times reais)
// Janela 3: após R32_01 (tudo travado)
export const JANELA_1_FIM    = '2026-06-11T19:00:00Z' // Kickoff A1 (16h BRT)
export const JANELA_3_INICIO = '2026-06-28T19:00:00Z' // Kickoff R32_01 — RSA×CAN (16h BRT)

// Mapeamento R32_01–12: qual posição de grupo joga em cada slot
export const R32_CHAVEAMENTO = {
  R32_01: { t1: { pos: 1, grupo: 'A' }, t2: { pos: 2, grupo: 'B' } },
  R32_02: { t1: { pos: 1, grupo: 'C' }, t2: { pos: 2, grupo: 'D' } },
  R32_03: { t1: { pos: 1, grupo: 'E' }, t2: { pos: 2, grupo: 'F' } },
  R32_04: { t1: { pos: 1, grupo: 'G' }, t2: { pos: 2, grupo: 'H' } },
  R32_05: { t1: { pos: 1, grupo: 'I' }, t2: { pos: 2, grupo: 'J' } },
  R32_06: { t1: { pos: 1, grupo: 'K' }, t2: { pos: 2, grupo: 'L' } },
  R32_07: { t1: { pos: 2, grupo: 'A' }, t2: { pos: 1, grupo: 'B' } },
  R32_08: { t1: { pos: 2, grupo: 'C' }, t2: { pos: 1, grupo: 'D' } },
  R32_09: { t1: { pos: 2, grupo: 'E' }, t2: { pos: 1, grupo: 'F' } },
  R32_10: { t1: { pos: 2, grupo: 'G' }, t2: { pos: 1, grupo: 'H' } },
  R32_11: { t1: { pos: 2, grupo: 'I' }, t2: { pos: 1, grupo: 'J' } },
  R32_12: { t1: { pos: 2, grupo: 'K' }, t2: { pos: 1, grupo: 'L' } },
}

// Infere o 1º e 2º de cada grupo a partir dos palpites do usuário
export function inferirClassificados(palpites) {
  const resultado = {}
  for (const [grupoId, grupo] of Object.entries(GRUPOS)) {
    const jogos = gerarJogosGrupo(grupoId)
    const pts = {}, saldo = {}, gp = {}
    for (const t of grupo.times) { pts[t] = 0; saldo[t] = 0; gp[t] = 0 }
    let temPalpite = false
    for (const jogo of jogos) {
      const p = palpites[jogo.id]
      if (p?.g1 === '' || p?.g1 === undefined || p?.g2 === '' || p?.g2 === undefined) continue
      const g1 = Number(p.g1), g2 = Number(p.g2)
      if (isNaN(g1) || isNaN(g2)) continue
      temPalpite = true
      gp[jogo.t1] += g1; gp[jogo.t2] += g2
      saldo[jogo.t1] += g1 - g2; saldo[jogo.t2] += g2 - g1
      if (g1 > g2) pts[jogo.t1] += 3
      else if (g2 > g1) pts[jogo.t2] += 3
      else { pts[jogo.t1]++; pts[jogo.t2]++ }
    }
    if (!temPalpite) { resultado[grupoId] = null; continue }
    const ord = [...grupo.times].sort((a, b) =>
      pts[b] - pts[a] || saldo[b] - saldo[a] || gp[b] - gp[a]
    )
    resultado[grupoId] = { primeiro: ord[0], segundo: ord[1] }
  }
  return resultado
}

// ── Utilitários de lock ────────────────────────────────────
export function jogoTravado(jogoId, now = Date.now()) {
  const kickoff = KICKOFF_MAP[jogoId]
  return kickoff ? now >= new Date(kickoff).getTime() : false
}

export function formatarHorarioBRT(isoUtc) {
  if (!isoUtc) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(isoUtc))
}

export function getTodosJogosGrupos() {
  return Object.keys(GRUPOS).flatMap((g) => gerarJogosGrupo(g))
}

export const AGENDA_GRUPOS = getTodosJogosGrupos()

// ── Pontuação ──────────────────────────────────────────────
export const PONTOS = {
  PLACAR_EXATO: 3,
  RESULTADO_CERTO: 1,
  ERRO: 0,
}

export function calcularPontos(palpite, resultado) {
  if (!palpite || !resultado) return 0
  const pg1 = Number(palpite.g1)
  const pg2 = Number(palpite.g2)
  const rg1 = Number(resultado.g1)
  const rg2 = Number(resultado.g2)
  if (isNaN(pg1) || isNaN(pg2) || isNaN(rg1) || isNaN(rg2)) return 0
  if (pg1 === rg1 && pg2 === rg2) return PONTOS.PLACAR_EXATO
  if (Math.sign(pg1 - pg2) === Math.sign(rg1 - rg2)) return PONTOS.RESULTADO_CERTO
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
