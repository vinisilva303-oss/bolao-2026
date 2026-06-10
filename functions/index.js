const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const axios = require('axios')

admin.initializeApp()
const db = admin.firestore()

// Secrets gerenciados pelo Firebase Secret Manager
const apifootballKey = defineSecret('APIFOOTBALL_KEY')
const adminKey = defineSecret('ADMIN_KEY')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIXTURE_MAP: ID da API-Football → ID interno do bolão
//
// Como obter os IDs:
//   1. Apos o deploy, chame: GET /listarFixtureIds
//      Header: X-Admin-Key: <valor do secret ADMIN_KEY>
//   2. Para cada fixture, pegue o campo "id"
//   3. Mapeie para o ID interno (A1-A6, B1-B6 ... L1-L6)
//
// Fase de grupos: A1-A6 ... L1-L6
// Mata-mata:      R32_1..16, R16_1..8, QF_1..4, SF_1..2, 3RD, FIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FIXTURE_MAP = {
  // Preencher apos chamar listarFixtureIds:
  // 1234567: 'A1',
  // 1234568: 'A2',
}

exports.atualizarResultados = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'America/Sao_Paulo',
    secrets: [apifootballKey],
  },
  async () => {
    const API_KEY = apifootballKey.value()

    if (!Object.keys(FIXTURE_MAP).length) {
      console.warn('[atualizarResultados] FIXTURE_MAP vazio — nenhum jogo sera atualizado.')
      return
    }

    const hoje = new Date().toISOString().split('T')[0]
    console.log(`[atualizarResultados] Buscando jogos de ${hoje}...`)

    let fixtures
    try {
      const res = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
        params: { league: '1', season: '2026', date: hoje },
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
        timeout: 10000,
      })
      fixtures = res.data.response
      console.log(`[atualizarResultados] ${fixtures.length} fixtures recebidas.`)
    } catch (err) {
      console.error('[atualizarResultados] Erro na API-Football:', err.message)
      return
    }

    const batch = db.batch()
    let atualizados = 0

    for (const fixture of fixtures) {
      if (fixture.fixture.status.short !== 'FT') continue

      const jogoId = FIXTURE_MAP[fixture.fixture.id]
      if (!jogoId) continue

      const g1 = fixture.goals.home
      const g2 = fixture.goals.away
      if (g1 === null || g2 === null) continue

      // Nao sobrescreve resultado inserido manualmente pelo admin
      const existente = await db.collection('resultados_globais').doc(jogoId).get()
      if (existente.exists && existente.data().manual === true) {
        console.log(`[atualizarResultados] ${jogoId} com resultado manual — pulando.`)
        continue
      }

      batch.set(db.collection('resultados_globais').doc(jogoId), {
        g1,
        g2,
        fonte: 'api-football',
        manual: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      atualizados++
    }

    if (atualizados > 0) {
      await batch.commit()
      console.log(`[atualizarResultados] ${atualizados} resultado(s) salvos.`)
    } else {
      console.log('[atualizarResultados] Nenhum resultado novo.')
    }
  }
)

// Funcao HTTP para listar IDs brutos da API e montar o FIXTURE_MAP.
// GET https://us-central1-bolao-copa-2026-28714.cloudfunctions.net/listarFixtureIds
// Header: X-Admin-Key: <valor do secret ADMIN_KEY>
exports.listarFixtureIds = onRequest(
  { secrets: [adminKey, apifootballKey] },
  async (req, res) => {
    if (req.headers['x-admin-key'] !== adminKey.value()) {
      res.status(401).json({ error: 'Nao autorizado' })
      return
    }

    try {
      const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
        params: { league: '1', season: '2026' },
        headers: {
          'X-RapidAPI-Key': apifootballKey.value(),
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
        timeout: 15000,
      })

      const fixtures = response.data.response.map((f) => ({
        id: f.fixture.id,
        date: f.fixture.date,
        home: f.teams.home.name,
        away: f.teams.away.name,
        status: f.fixture.status.short,
        goals: f.goals,
      }))

      res.json({ total: fixtures.length, fixtures })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)
