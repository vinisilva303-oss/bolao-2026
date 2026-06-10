import { useState, useEffect } from 'react'
import { ouvirTodosPalpites, ouvirResultados, ouvirParticipantes } from '../lib/firestore'
import { calcularPontos, AGENDA_GRUPOS } from '../lib/dados'

export function useRanking(slug) {
  const [participantes, setParticipantes] = useState([])
  const [todosPalpites, setTodosPalpites] = useState({})
  const [resultados, setResultados] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let loaded = 0
    const check = () => { if (++loaded === 3) setLoading(false) }

    const u1 = ouvirParticipantes(slug, (p) => { setParticipantes(p); check() })
    const u2 = ouvirTodosPalpites(slug, (p) => { setTodosPalpites(p); check() })
    const u3 = ouvirResultados(slug, (r) => { setResultados(r); check() })

    return () => { u1(); u2(); u3() }
  }, [slug])

  const ranking = participantes
    .map((p) => {
      const palp = todosPalpites[p.id] || {}
      let pontos = 0
      let exatos = 0
      let resultadosCertos = 0

      for (const jogo of AGENDA_GRUPOS) {
        const resultado = resultados[jogo.id]
        if (!resultado) continue
        const pts = calcularPontos(palp[jogo.id], resultado)
        pontos += pts
        if (pts === 3) exatos++
        else if (pts === 1) resultadosCertos++
      }

      return { ...p, pontos, exatos, resultados: resultadosCertos }
    })
    .sort((a, b) => b.pontos - a.pontos || b.exatos - a.exatos)

  return { ranking, loading }
}
