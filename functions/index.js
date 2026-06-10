const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')

admin.initializeApp()
const db = admin.firestore()

// Mapeamento de IDs da API-Football para IDs internos
// Preencher na Semana 5 após confirmar os IDs no painel da API
const FIXTURE_MAP = {
  // exemplo: 12345: 'A1'
}

exports.atualizarResultados = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const hoje = new Date().toISOString().split('T')[0]

    const response = await axios.get(
      'https://api-football-v1.p.rapidapi.com/v3/fixtures',
      {
        params: { league: '1', season: '2026', date: hoje },
        headers: {
          'X-RapidAPI-Key': functions.config().apifootball.key,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    )

    const fixtures = response.data.response
    for (const fixture of fixtures) {
      if (fixture.fixture.status.short !== 'FT') continue

      const jogoId = FIXTURE_MAP[fixture.fixture.id]
      if (!jogoId) continue

      // Não sobrescreve resultado já confirmado manualmente
      const existente = await db.collection('resultados_globais').doc(jogoId).get()
      if (existente.exists && existente.data().manual === true) continue

      await db.collection('resultados_globais').doc(jogoId).set({
        g1: fixture.goals.home,
        g2: fixture.goals.away,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        manual: false,
      })
    }
  })
