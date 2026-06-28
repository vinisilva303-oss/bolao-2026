import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, getDocs,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Usuários ────────────────────────────────────────────────
export async function salvarUsuario(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    })
  }
}

export async function getUsuario(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ── Bolões ──────────────────────────────────────────────────
export async function criarBolao({ slug, name, ownerId }) {
  const ref = doc(db, 'boloes', slug)
  const snap = await getDoc(ref)
  if (snap.exists()) throw new Error('Esse slug já existe. Escolha outro nome.')

  await setDoc(ref, {
    slug,
    name,
    ownerId,
    plan: 'free',
    active: true,
    createdAt: serverTimestamp(),
  })
  return slug
}

export async function getBolao(slug) {
  const snap = await getDoc(doc(db, 'boloes', slug))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function ouvirBolao(slug, callback) {
  return onSnapshot(doc(db, 'boloes', slug), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function getBoloesPorOwner(ownerId) {
  const q = query(
    collection(db, 'boloes'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export function ouvirBoloesPorOwner(ownerId, callback, onError) {
  // Sem orderBy para evitar índice composto obrigatório; ordenamos no cliente.
  const q = query(collection(db, 'boloes'), where('ownerId', '==', ownerId))
  return onSnapshot(
    q,
    (snap) => {
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0
          const tb = b.createdAt?.toMillis?.() ?? 0
          return tb - ta
        })
      callback(lista)
    },
    (err) => {
      console.error('ouvirBoloesPorOwner:', err)
      if (onError) onError(err)
    },
  )
}

export async function ativarPro(slug) {
  await updateDoc(doc(db, 'boloes', slug), { plan: 'pro' })
}

export async function atualizarCenario(slug, cenario) {
  await updateDoc(doc(db, 'boloes', slug), { cenario })
}

export async function deletarBolao(slug) {
  const subs = ['participantes', 'palpites', 'resultados', 'mata_mata']
  for (const sub of subs) {
    const snap = await getDocs(collection(db, 'boloes', slug, sub))
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }
  await deleteDoc(doc(db, 'boloes', slug))
}

// ── Participantes ───────────────────────────────────────────
export async function entrarNoBolao(slug, participante) {
  const ref = doc(db, 'boloes', slug, 'participantes', participante.id)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { name: participante.name })
  } else {
    await setDoc(ref, { name: participante.name, joinedAt: serverTimestamp() })
  }
}

export function ouvirParticipantes(slug, callback) {
  const q = query(
    collection(db, 'boloes', slug, 'participantes'),
    orderBy('joinedAt', 'asc'),
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function getParticipantes(slug) {
  const q = query(
    collection(db, 'boloes', slug, 'participantes'),
    orderBy('joinedAt', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ── Palpites ────────────────────────────────────────────────
export async function salvarPalpites(slug, participanteId, palpites) {
  await setDoc(
    doc(db, 'boloes', slug, 'palpites', participanteId),
    { ...palpites, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export function ouvirPalpites(slug, participanteId, callback) {
  return onSnapshot(
    doc(db, 'boloes', slug, 'palpites', participanteId),
    (snap) => callback(snap.exists() ? snap.data() : {}),
  )
}

export async function getTodosPalpites(slug) {
  const snap = await getDocs(collection(db, 'boloes', slug, 'palpites'))
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))
}

export function ouvirTodosPalpites(slug, callback) {
  return onSnapshot(collection(db, 'boloes', slug, 'palpites'), (snap) => {
    const palpites = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))
    callback(palpites)
  })
}

// ── Resultados ──────────────────────────────────────────────
export async function salvarResultado(slug, jogoId, g1, g2) {
  await setDoc(
    doc(db, 'boloes', slug, 'resultados', jogoId),
    { g1, g2, updatedAt: serverTimestamp() },
  )
}

export function ouvirResultados(slug, callback) {
  return onSnapshot(collection(db, 'boloes', slug, 'resultados'), (snap) => {
    const resultados = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))
    callback(resultados)
  })
}

// ── Mata-Mata — times definidos pelo admin após os grupos ──
export async function salvarTimesMataMata(slug, matchId, t1, t2) {
  await setDoc(
    doc(db, 'boloes', slug, 'mata_mata', matchId),
    { t1, t2, updatedAt: serverTimestamp() },
  )
}

export function ouvirMataMata(slug, callback) {
  return onSnapshot(collection(db, 'boloes', slug, 'mata_mata'), (snap) => {
    callback(Object.fromEntries(snap.docs.map((d) => [d.id, d.data()])))
  })
}

// ── Resultados Globais (Cloud Function ou painel admin) ──────
export function ouvirResultadosGlobais(callback) {
  return onSnapshot(collection(db, 'resultados_globais'), (snap) => {
    const resultados = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))
    callback(resultados)
  })
}

export async function salvarResultadoGlobal(jogoId, g1, g2) {
  await setDoc(
    doc(db, 'resultados_globais', jogoId),
    { g1, g2, fonte: 'admin-painel', manual: true, updatedAt: serverTimestamp() },
  )
}

export async function listarTodosBoloes() {
  const snap = await getDocs(collection(db, 'boloes'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function reatribuirDono(slug, novoOwnerId) {
  await updateDoc(doc(db, 'boloes', slug), { ownerId: novoOwnerId })
}
