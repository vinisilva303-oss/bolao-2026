const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const axios = require('axios')

admin.initializeApp()
const db = admin.firestore()

const apifootballKey = defineSecret('APIFOOTBALL_KEY')
const adminKey = defineSecret('ADMIN_KEY')

// ── Mapeamento de nomes da API-Football → código interno ──
const TEAM_CODE = {
  'mexico': 'MEX',
  'south africa': 'RSA',
  'south korea': 'KOR', 'korea republic': 'KOR', 'korea': 'KOR',
  'czech republic': 'CZE', 'czechia': 'CZE',
  'canada': 'CAN',
  'bosnia and herzegovina': 'BIH', 'bosnia-herzegovina': 'BIH', 'bosnia & herzegovina': 'BIH',
  'qatar': 'QAT',
  'switzerland': 'SUI',
  'brazil': 'BRA', 'brasil': 'BRA',
  'morocco': 'MAR',
  'haiti': 'HAI',
  'scotland': 'SCO',
  'united states': 'USA', 'usa': 'USA', 'us': 'USA',
  'paraguay': 'PAR',
  'australia': 'AUS',
  'turkey': 'TUR', 'turkiye': 'TUR', 'türkiye': 'TUR',
  'germany': 'ALE',
  'curacao': 'CUR', 'curaçao': 'CUR',
  'ivory coast': 'CIV', "cote d'ivoire": 'CIV', 'côte d\'ivoire': 'CIV',
  'ecuador': 'ECU',
  'netherlands': 'HOL', 'holland': 'HOL',
  'japan': 'JPN',
  'sweden': 'SWE',
  'tunisia': 'TUN',
  'belgium': 'BEL',
  'egypt': 'EGI',
  'iran': 'IRA',
  'new zealand': 'NZL',
  'spain': 'ESP',
  'cape verde': 'CPV', 'cabo verde': 'CPV',
  'saudi arabia': 'SAU',
  'uruguay': 'URU',
  'france': 'FRA',
  'senegal': 'SEN',
  'iraq': 'IRA2',
  'norway': 'NOR',
  'argentina': 'ARG',
  'algeria': 'ALG',
  'austria': 'AUT',
  'jordan': 'JOR',
  'portugal': 'POR',
  'dr congo': 'CGO', 'congo dr': 'CGO', 'democratic republic of congo': 'CGO', 'republic of congo': 'CGO',
  'uzbekistan': 'UZB',
  'colombia': 'COL',
  'england': 'ENG',
  'croatia': 'CRO',
  'ghana': 'GHA',
  'panama': 'PAN',
}

// ── Jogos da fase de grupos: código_interno → jogoId ──────
const GRUPOS = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'SUI'],
  C: ['BRA', 'MAR', 'HAI', 'SCO'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['ALE', 'CUR', 'CIV', 'ECU'],
  F: ['HOL', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGI', 'IRA', 'NZL'],
  H: ['ESP', 'CPV', 'SAU', 'URU'],
  I: ['FRA', 'SEN', 'IRA2', 'NOR'],
  J: ['ARG', 'ALG', 'AUT', 'JOR'],
  K: ['POR', 'CGO', 'UZB', 'COL'],
  L: ['ENG', 'CRO', 'GHA', 'PAN'],
}

function buildMatchMap() {
  const map = {}
  for (const [g, [t1, t2, t3, t4]] of Object.entries(GRUPOS)) {
    const pairs = [
      [t1, t2, 1], [t3, t4, 2],
      [t1, t3, 3], [t2, t4, 4],
      [t1, t4, 5], [t2, t3, 6],
    ]
    for (const [a, b, n] of pairs) {
      const jogoId = `${g}${n}`
      map[`${a}-${b}`] = jogoId
      map[`${b}-${a}`] = jogoId
    }
  }
  return map
}

const MATCH_MAP = buildMatchMap()

function normalizeTeam(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveJogoId(homeRaw, awayRaw) {
  const homeCode = TEAM_CODE[normalizeTeam(homeRaw)]
  const awayCode = TEAM_CODE[normalizeTeam(awayRaw)]
  if (!homeCode || !awayCode) return null
  return MATCH_MAP[`${homeCode}-${awayCode}`] || null
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: busca e persiste resultados de uma data específica
// Retorna { atualizados, pulados, naoMapeados, erros }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function buscarEAtualizar(apiKey, data, forcar = false) {
  console.log(`[buscarEAtualizar] data=${data} forcar=${forcar}`)

  let fixtures
  try {
    const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { league: '1', season: '2026', date: data },
      headers: { 'x-apisports-key': apiKey },
      timeout: 10000,
    })
    fixtures = res.data.response
    console.log(`[buscarEAtualizar] ${fixtures.length} fixtures recebidas para ${data}.`)
  } catch (err) {
    console.error(`[buscarEAtualizar] Erro na API-Football (${data}):`, err.message)
    return { atualizados: 0, pulados: 0, naoMapeados: [], erros: [err.message] }
  }

  const batch = db.batch()
  let atualizados = 0
  let pulados = 0
  const naoMapeados = []

  for (const fixture of fixtures) {
    if (fixture.fixture.status.short !== 'FT') continue

    const g1 = fixture.goals.home
    const g2 = fixture.goals.away
    if (g1 === null || g2 === null) continue

    const jogoId = resolveJogoId(fixture.teams.home.name, fixture.teams.away.name)
    if (!jogoId) {
      const aviso = `${fixture.teams.home.name} vs ${fixture.teams.away.name}`
      console.warn(`[buscarEAtualizar] Jogo nao mapeado: ${aviso}`)
      naoMapeados.push(aviso)
      continue
    }

    if (!forcar) {
      const existente = await db.collection('resultados_globais').doc(jogoId).get()
      if (existente.exists && existente.data().manual === true) {
        console.log(`[buscarEAtualizar] ${jogoId} com resultado manual — pulando.`)
        pulados++
        continue
      }
    }

    batch.set(db.collection('resultados_globais').doc(jogoId), {
      g1,
      g2,
      fonte: 'api-football',
      manual: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    atualizados++
    console.log(`[buscarEAtualizar] ${jogoId}: ${fixture.teams.home.name} ${g1}x${g2} ${fixture.teams.away.name}`)
  }

  if (atualizados > 0) {
    await batch.commit()
    console.log(`[buscarEAtualizar] ${atualizados} resultado(s) salvos para ${data}.`)
  } else {
    console.log(`[buscarEAtualizar] Nenhum resultado novo para ${data}.`)
  }

  return { atualizados, pulados, naoMapeados, erros: [] }
}

function dataOffset(offsetDias) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDias)
  return d.toISOString().split('T')[0]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cloud Function agendada: atualiza hoje + ontem a cada hora
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.atualizarResultados = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'America/Sao_Paulo',
    secrets: [apifootballKey],
  },
  async () => {
    const API_KEY = apifootballKey.value()
    const hoje = dataOffset(0)
    const ontem = dataOffset(-1)

    console.log(`[atualizarResultados] Rodando para ontem=${ontem} e hoje=${hoje}`)

    // Ontem primeiro (catch-up de jogos da madrugada/dia anterior)
    await buscarEAtualizar(API_KEY, ontem)
    // Hoje
    await buscarEAtualizar(API_KEY, hoje)
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP: força atualização para uma data arbitrária
// GET/POST ?data=YYYY-MM-DD  (padrão: hoje)
//          &forcar=true      (ignora resultados manuais)
// Header: X-Admin-Key: <ADMIN_KEY>
// Exemplo:
//   curl -H "X-Admin-Key: <key>" \
//     "https://<region>-bolao-copa-2026-28714.cloudfunctions.net/forcarAtualizacao?data=2026-06-11"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.forcarAtualizacao = onRequest(
  { secrets: [adminKey, apifootballKey] },
  async (req, res) => {
    if (req.headers['x-admin-key'] !== adminKey.value().trim()) {
      res.status(401).json({ error: 'Nao autorizado' })
      return
    }

    const data = req.query.data || dataOffset(0)
    const forcar = req.query.forcar === 'true'

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      res.status(400).json({ error: 'Formato de data invalido. Use YYYY-MM-DD.' })
      return
    }

    try {
      const resultado = await buscarEAtualizar(apifootballKey.value(), data, forcar)
      res.json({ data, forcar, ...resultado })
    } catch (err) {
      console.error('[forcarAtualizacao] Erro:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP: ajusta palpite de um participante (uso admin one-shot)
// POST body: { "slug": "...", "uid": "...", "jogoId": "F1", "g1": 2, "g2": 2 }
// Header: X-Admin-Key: <ADMIN_KEY>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.ajustarPalpite = onRequest(
  { secrets: [adminKey] },
  async (req, res) => {
    if (req.headers['x-admin-key'] !== adminKey.value().trim()) {
      res.status(401).json({ error: 'Nao autorizado' })
      return
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' })
      return
    }
    const { slug, uid, jogoId, g1, g2 } = req.body || {}
    if (!slug || !uid || !jogoId || typeof g1 !== 'number' || typeof g2 !== 'number') {
      res.status(400).json({ error: 'slug, uid, jogoId, g1 e g2 sao obrigatorios' })
      return
    }
    try {
      await db.doc(`boloes/${slug}/palpites/${uid}`).set(
        { [jogoId]: { g1, g2 } },
        { merge: true }
      )
      console.log(`[ajustarPalpite] ${slug}/${uid} ${jogoId}: ${g1}x${g2}`)
      res.json({ ok: true, slug, uid, jogoId, g1, g2 })
    } catch (err) {
      console.error('[ajustarPalpite] Erro:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP: salva resultado global manualmente (sem API-Football)
// POST com body JSON: { "jogoId": "A1", "g1": 2, "g2": 0 }
// Header: X-Admin-Key: <ADMIN_KEY>
// Isso grava em /resultados_globais e afeta TODOS os bolões.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.salvarResultadoGlobal = onRequest(
  { secrets: [adminKey] },
  async (req, res) => {
    if (req.headers['x-admin-key'] !== adminKey.value().trim()) {
      res.status(401).json({ error: 'Nao autorizado' })
      return
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' })
      return
    }

    const { jogoId, g1, g2 } = req.body || {}

    if (!jogoId || typeof jogoId !== 'string') {
      res.status(400).json({ error: 'jogoId obrigatorio (string)' })
      return
    }
    if (typeof g1 !== 'number' || typeof g2 !== 'number') {
      res.status(400).json({ error: 'g1 e g2 devem ser numeros' })
      return
    }

    try {
      await db.collection('resultados_globais').doc(jogoId).set({
        g1,
        g2,
        fonte: 'manual-admin',
        manual: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log(`[salvarResultadoGlobal] ${jogoId}: ${g1}x${g2}`)
      res.json({ ok: true, jogoId, g1, g2 })
    } catch (err) {
      console.error('[salvarResultadoGlobal] Erro:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP: lista todos os bolões (diagnóstico)
// GET
// Header: X-Admin-Key: <ADMIN_KEY>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.listarBoloes = onRequest(
  { secrets: [adminKey] },
  async (req, res) => {
    if (req.headers['x-admin-key'] !== adminKey.value().trim()) {
      res.status(401).json({ error: 'Nao autorizado' })
      return
    }
    const snap = await db.collection('boloes').get()
    const boloes = snap.docs.map((d) => ({ slug: d.id, name: d.data().name, tipo: d.data().tipo }))
    res.json({ total: boloes.length, boloes })
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP: copia palpites ausentes de um bolão para outro
// POST body: { "email": "...", "slugOrigem": "...", "slugDestino": "..." }
// Regras:
//   - só copia jogos sem palpite no destino
//   - ignora jogos que já têm resultado apurado em resultados_globais
// Header: X-Admin-Key: <ADMIN_KEY>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.copiarPalpites = onRequest(
  { secrets: [adminKey] },
  async (req, res) => {
    if (req.headers['x-admin-key'] !== adminKey.value().trim()) {
      res.status(401).json({ error: 'Nao autorizado' })
      return
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' })
      return
    }

    const { email, slugOrigem, slugDestino } = req.body || {}
    if (!email || !slugOrigem || !slugDestino) {
      res.status(400).json({ error: 'email, slugOrigem e slugDestino sao obrigatorios' })
      return
    }

    let uid
    try {
      const userRecord = await admin.auth().getUserByEmail(email)
      uid = userRecord.uid
    } catch (err) {
      res.status(404).json({ error: `Usuário não encontrado: ${email}` })
      return
    }

    const [snapOrigem, snapDestino, snapResultados] = await Promise.all([
      db.doc(`boloes/${slugOrigem}/palpites/${uid}`).get(),
      db.doc(`boloes/${slugDestino}/palpites/${uid}`).get(),
      db.collection('resultados_globais').get(),
    ])

    const palpitesOrigem = snapOrigem.exists ? snapOrigem.data() : {}
    const palpitesDestino = snapDestino.exists ? snapDestino.data() : {}
    const jogosApurados = new Set(snapResultados.docs.map((d) => d.id))

    const aCopiar = {}
    for (const [jogoId, palpite] of Object.entries(palpitesOrigem)) {
      if (jogoId === 'updatedAt') continue
      if (jogosApurados.has(jogoId)) continue              // resultado já apurado
      if (palpitesDestino[jogoId] !== undefined) continue   // já tem palpite no destino
      if (palpite?.g1 === undefined || palpite?.g2 === undefined) continue
      aCopiar[jogoId] = { g1: palpite.g1, g2: palpite.g2 }
    }

    if (Object.keys(aCopiar).length === 0) {
      res.json({ ok: true, copiados: 0, uid, msg: 'Nenhum palpite elegivel para copiar.' })
      return
    }

    await db.doc(`boloes/${slugDestino}/palpites/${uid}`).set(
      { ...aCopiar, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    )

    console.log(`[copiarPalpites] ${uid}: ${slugOrigem} → ${slugDestino}, ${Object.keys(aCopiar).length} jogos: ${Object.keys(aCopiar).join(', ')}`)
    res.json({ ok: true, uid, copiados: Object.keys(aCopiar).length, jogos: Object.keys(aCopiar) })
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP: diagnóstico — lista fixtures da API para uma data
// GET ?data=YYYY-MM-DD  (padrão: hoje)
// Header: X-Admin-Key: <ADMIN_KEY>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.listarFixtureIds = onRequest(
  { secrets: [adminKey, apifootballKey] },
  async (req, res) => {
    if (req.headers['x-admin-key'] !== adminKey.value().trim()) {
      res.status(401).json({ error: 'Nao autorizado' })
      return
    }

    const data = req.query.data || dataOffset(0)

    try {
      const params = { league: '1', season: '2026' }
      if (data) params.date = data

      const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params,
        headers: { 'x-apisports-key': apifootballKey.value() },
        timeout: 15000,
      })

      const fixtures = response.data.response.map((f) => {
        const home = f.teams.home.name
        const away = f.teams.away.name
        return {
          id: f.fixture.id,
          date: f.fixture.date,
          home,
          away,
          jogoId: resolveJogoId(home, away),
          status: f.fixture.status.short,
          goals: f.goals,
        }
      })

      const naoMapeados = fixtures.filter((f) => !f.jogoId)

      res.json({
        data,
        total: fixtures.length,
        mapeados: fixtures.filter((f) => f.jogoId).length,
        naoMapeados: naoMapeados.length,
        fixtures,
        alertas: naoMapeados.map((f) => `${f.home} vs ${f.away}`),
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)
