import { useState, useEffect } from 'react'
import { simTime } from './simTime'

// Retorna o timestamp atual (real ou simulado).
// Atualiza automaticamente a cada `intervalMs` ms e quando o DevPanel muda o tempo.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => simTime.now())
  useEffect(() => {
    const update = () => setNow(simTime.now())
    window.addEventListener('simtime', update)
    const id = setInterval(update, intervalMs)
    return () => {
      window.removeEventListener('simtime', update)
      clearInterval(id)
    }
  }, [intervalMs])
  return now
}
