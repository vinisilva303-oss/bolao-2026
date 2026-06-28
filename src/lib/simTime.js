// Simulação de tempo para desenvolvimento.
// Em produção (import.meta.env.DEV === false), sempre retorna Date.now().
const KEY = 'bolao_dev_simtime'

export const simTime = {
  get() {
    if (!import.meta.env.DEV) return null
    const v = localStorage.getItem(KEY)
    return v ? parseInt(v, 10) : null
  },
  set(ms) {
    localStorage.setItem(KEY, String(ms))
    window.dispatchEvent(new Event('simtime'))
  },
  clear() {
    localStorage.removeItem(KEY)
    window.dispatchEvent(new Event('simtime'))
  },
  now() {
    return simTime.get() ?? Date.now()
  },
  isActive() {
    return import.meta.env.DEV && simTime.get() !== null
  },
}
