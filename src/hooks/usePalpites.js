import { useState, useEffect } from 'react'
import { ouvirPalpites, ouvirTodosPalpites } from '../lib/firestore'

export function usePalpites(slug, participanteId) {
  const [palpites, setPalpites] = useState({})

  useEffect(() => {
    if (!slug || !participanteId) return
    return ouvirPalpites(slug, participanteId, setPalpites)
  }, [slug, participanteId])

  return palpites
}

export function useTodosPalpites(slug) {
  const [todos, setTodos] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    const unsub = ouvirTodosPalpites(slug, (p) => {
      setTodos(p)
      setLoading(false)
    })
    return unsub
  }, [slug])

  return { todos, loading }
}
