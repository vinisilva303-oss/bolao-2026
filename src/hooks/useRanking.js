import { useState, useEffect } from 'react'
import { ouvirTodosPalpites, ouvirResultados, ouvirParticipantes, ouvirResultadosGlobais } from '../lib/firestore'
import { calcularPontos } from '../lib/dados'

export function useRanking(slug) {
  const [participantes, setParticipantes] = useState([])
  const [todosPalpites, setTodosPalpites] = useState({})
  const [resultadosBolao, setResultadosBolao] = useState({})     // admin inseriu manualmente
  const [resultadosGlobais, setResultadosGlobais] = useState({}) // API-Football auto
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let loaded = 0
    const check = () => { if (++loaded === 4) setLoading(false) }

    const u1 = ouvirParticipantes(slug, (p) => { setParticipantes(p); check() })
    const u2 = ouvirTodosPalpites(slug, (p) => { setTodosPalpites(p); check() })
    const u3 = ouvirResultados(slug, (r) => { setResultadosBolao(r); check() })
    const u4 = ouvirResultadosGlobais((r) => { setResultadosGlobais(r); check() })

    return () => { u1(); u2(); u3(); u4() }
  }, [slug])

  // Resultado por bolão tem prioridade sobre o global (admin pode corrigir)
  const resultados = { ...resultadosGlobais, ...resultadosBolao }

  const ranking = participantes
    .map((p) => {
      const palp = todosPalpites[p.id] || {}
      let pontos = 0
      let exatos = 0
      let resultadosCertos = 0

      for (const [jogoId, resultado] of Object.entries(resultados)) {
        const pts = calcularPontos(palp[jogoId], resultado)
        pontos += pts
        if (pts === 3) exatos++
        else if (pts === 1) resultadosCertos++
      }

      return { ...p, pontos, exatos, resultados: resultadosCertos }
    })
    .sort((a, b) => b.pontos - a.pontos || b.exatos - a.exatos)

  return { ranking, loading, resultados, todosPalpites }
}
