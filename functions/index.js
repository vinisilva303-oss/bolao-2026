const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')

admin.initializeApp()
const db = admin.firestore()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIXTURE_MAP: ID da API-Football → ID interno do bolão
//
// Como obter os IDs:
//   1. Acesse: https://rapidapi.com/api-sports/api/api-football
//   2. Endpoint: GET /fixtures?league=1&season=2026
//   3. Para cada fixture, pegue fixture.fixture.id
//   4. Mapeie para o ID interno (ex: 'A1', 'B3', 'C6'...)
//
// Formato dos IDs internos:
//   Fase de grupos: A1-A6, B1-B6 ... L1-L6 (6 jogos por grupo)
//   Rodada 32: R32_1 ... R32_16
//   Oitavas:   R16_1 ... R16_8
//   Quartas:   QF_1 ... QF_4
//   Semis:     SF_1, SF_2
//   3° lugar:  3RD
//   Final:     FIN
//
// ⚠️ Preencher após confirmar os IDs na API (Semana 5).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FIXTURE_MAP = {
  // exemplo — substituir pelos IDs reais:
  // 1234567: 'A1',
  // 1234568: 'A2',
}

// Configurar via Firebase CLI:
//   firebase functions:config:set apifootball.key="SUA_CHAVE_RAPIDAPI"
const API_KEY = functions.config().apifootball?.key

exports.atualizarResultados = functions.pubsub
  .schedule('every 60 minutes')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    if (!API_KEY) {
      console.error('[atualizarResultados] API key não configurada. Execute: firebase functions:config:set apifootball.key="SUA_CHAVE"')
      return null
    }

    if (!Object.keys(FIXTURE_MAP).length) {
      console.warn('[atualizarResultados] FIXTURE_MAP vazio — nenhum jogo será atualizado.')
      return null
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
      console.log(`[atualizarResultados] ${fixtures.length} fixtures encontradas.`)
    } catch (err) {
      console.error('[atualizarResultados] Erro ao chamar API-Football:', err.message)
      return null
    }

    const batch = db.batch()
    let atualizados = 0

    for (const fixture of fixtures) {
      // Só processa jogos encerrados
      if (fixture.fixture.status.short !== 'FT') continue

      const jogoId = FIXTURE_MAP[fixture.fixture.id]
      if (!jogoId) continue

      const g1 = fixture.goals.home
      const g2 = fixture.goals.away

      if (g1 === null || g2 === null) continue

      // Não sobrescreve resultado marcado como manual (inserido pelo admin)
      const existente = await db.collection('resultados_globais').doc(jogoId).get()
      if (existente.exists && existente.data().manual === true) {
        console.log(`[atualizarResultados] ${jogoId} tem resultado manual — pulando.`)
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
      console.log('[atualizarResultados] Nenhum resultado novo para salvar.')
    }

    return null
  })

// Função HTTP para listar os IDs brutos da API (use para montar o FIXTURE_MAP)
// Acesso: https://us-central1-SEU_PROJETO.cloudfunctions.net/listarFixtureIds
// Protegida: só funciona com o header X-Admin-Key correto
exports.listarFixtureIds = functions.https.onRequest(async (req, res) => {
  const adminKey = functions.config().admin?.key
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    res.status(401).json({ error: 'Não autorizado' })
    return
  }

  if (!API_KEY) {
    res.status(500).json({ error: 'API key não configurada' })
    return
  }

  try {
    const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
      params: { league: '1', season: '2026' },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
      },
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
})
