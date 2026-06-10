import { useState, useEffect } from 'react'
import { ouvirBolao } from '../lib/firestore'

export function useBolao(slug) {
  const [bolao, setBolao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!slug) return
    const unsub = ouvirBolao(slug, (b) => {
      setBolao(b)
      if (!b) setErro('Bolão não encontrado.')
      setLoading(false)
    })
    return unsub
  }, [slug])

  return { bolao, loading, erro }
}
