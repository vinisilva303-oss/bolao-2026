# Bolão Copa 2026 — Plano de Execução para Claude Code

> **Documento de contexto completo para ser usado como referência no Claude Code.**  
> Leia este arquivo no início de cada sessão de desenvolvimento.

---

## 🎯 Visão do Produto

Plataforma SaaS de bolão online para a Copa do Mundo 2026. Qualquer pessoa cria um bolão em minutos, compartilha por link, participantes registram palpites e acompanham ranking em tempo real.

**Modelo:** Freemium  
**Público:** Grupos de amigos, família e empresas (B2C)  
**Prazo MVP:** 5 semanas a partir do início do desenvolvimento  
**Copa começa:** 11 de junho de 2026

---

## 📦 Planos

### ⚽ Free — Grátis
- 1 bolão ativo por vez
- Até 10 participantes
- Ranking automático
- Compartilha por link
- Agenda + palpites
- ❌ Sem painel admin de resultados
- ❌ Sem exportar ranking

### 🥇 Pro — R$ 29 / bolão (pagamento único)
- Participantes ilimitados
- Painel admin para inserir resultados reais
- Exportar ranking em PDF
- Badge "Bolão Oficial" ⭐
- Suporte via WhatsApp
- Pagamento via Pix

---

## 💸 Fluxo de Pagamento (Pix Manual)

1. Usuário clica em **"Upgrade para Pro"**
2. Tela exibe **QR Code Pix estático** com valor R$ 29
3. Botão **"Enviar comprovante"** abre WhatsApp do admin com mensagem pré-preenchida:  
   `"Olá! Acabei de pagar o Bolão Pro. Meu bolão: [slug]. Segue o comprovante."`
4. Admin recebe, confirma pagamento
5. Admin acessa painel e clica **"Ativar Pro"** no bolão correspondente
6. Usuário recebe notificação / vê status atualizado

> **Sem gateway de pagamento. Zero taxas. Custo mensal: ~R$ 3 (só domínio).**

---

## 🛠️ Stack Técnica

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend | React + Vite | Migrar do HTML atual |
| Banco de dados | Firebase Firestore | Tempo real nativo |
| Autenticação | Firebase Auth | Login com Google |
| Hospedagem | Vercel | Deploy automático via GitHub |
| Resultados auto | API-Football + Cloud Functions | 100 req/dia grátis |
| Pagamento | Pix manual + WhatsApp | QR Code estático no frontend |
| Domínio | A definir (.com.br) | Registro.br |

---

## 🗄️ Estrutura de Dados (Firestore)

```
/users/{userId}
  - name: string
  - email: string
  - whatsapp: string
  - createdAt: timestamp

/boloes/{bolaoId}
  - slug: string          // ex: "familia-silva-2026"
  - name: string          // ex: "Bolão da Família Silva"
  - ownerId: string       // userId do criador
  - plan: "free" | "pro"
  - createdAt: timestamp
  - active: boolean

/boloes/{bolaoId}/participantes/{participanteId}
  - name: string
  - joinedAt: timestamp

/boloes/{bolaoId}/palpites/{participanteId}
  - {jogoId}: { g1: number, g2: number }   // ex: C1: { g1: 2, g2: 1 }

/boloes/{bolaoId}/resultados
  - {jogoId}: { g1: number, g2: number }   // resultado real
```

---

## 📁 Estrutura de Pastas do Projeto

```
bolao-2026/
├── public/
├── src/
│   ├── components/
│   │   ├── Agenda.jsx
│   │   ├── Palpites.jsx
│   │   ├── Ranking.jsx
│   │   ├── Admin.jsx
│   │   └── UpgradePro.jsx
│   ├── pages/
│   │   ├── Home.jsx          // landing page
│   │   ├── CriarBolao.jsx
│   │   ├── Bolao.jsx         // página pública /bolao/:slug
│   │   └── Admin.jsx         // /admin/:slug (protegido)
│   ├── lib/
│   │   ├── firebase.js       // config + exports
│   │   ├── firestore.js      // helpers de leitura/escrita
│   │   └── dados.js          // times, grupos, mata-mata, horários
│   ├── hooks/
│   │   ├── useBolao.js
│   │   ├── usePalpites.js
│   │   └── useRanking.js
│   ├── App.jsx
│   └── main.jsx
├── functions/               // Firebase Cloud Functions
│   └── index.js             // busca resultados via API-Football
├── .env.local               // chaves Firebase (não commitar)
├── firebase.json
├── firestore.rules
└── vite.config.js
```

---

## 🗺️ Roadmap de 5 Semanas

### Semana 1–2 · Fundação & Auth (~14h)
**Objetivo:** App no ar com login funcionando

- [ ] Criar projeto Firebase (Firestore + Auth + Functions)
- [ ] Iniciar projeto React + Vite: `npm create vite@latest bolao-2026 -- --template react`
- [ ] Instalar dependências: `npm install firebase react-router-dom`
- [ ] Configurar `src/lib/firebase.js` com as credenciais do projeto
- [ ] Implementar login com Google (Firebase Auth)
- [ ] Migrar dados do HTML atual (times, grupos, horários) para `src/lib/dados.js`
- [ ] Criar repositório no GitHub e conectar ao Vercel
- [ ] Primeiro deploy no ar

**Entregável:** URL pública com tela de login funcionando

---

### Semana 3–4 · Bolão Multi-Usuário (~14h)
**Objetivo:** Bolão compartilhável com palpites na nuvem

- [ ] Tela "Criar Bolão" → gerar slug único → salvar no Firestore
- [ ] Rota pública `/bolao/:slug` — participante acessa sem conta
- [ ] Formulário de palpites salvando no Firestore em tempo real
- [ ] Ranking ao vivo usando `onSnapshot` do Firestore
- [ ] Painel admin `/admin/:slug` — protegido por `ownerId`
- [ ] Admin insere resultados reais → ranking recalcula automaticamente
- [ ] Lógica de pontuação: placar exato = 3pts, resultado = 1pt, erro = 0

**Entregável:** Bolão funcionando do início ao fim, link compartilhável

---

### Semana 5 · Freemium, Pix & Resultados Auto (~10h)
**Objetivo:** Monetização e automação

- [ ] Lógica de limites: free bloqueia após 10 participantes + bloqueia admin de resultados
- [ ] Tela `UpgradePro.jsx`:
  - Exibir QR Code Pix (imagem estática gerada previamente)
  - Botão WhatsApp com link: `https://wa.me/55SEUNUMERO?text=...`
  - Mensagem pré-preenchida com slug do bolão
- [ ] Campo `plan` no Firestore: admin atualiza para `"pro"` após confirmar Pix
- [ ] Configurar API-Football no RapidAPI (plano gratuito)
- [ ] Cloud Function `atualizarResultados`:
  - Trigger: agendada a cada 1h
  - Lógica: buscar jogos do dia → se `status === "FT"` → salvar no Firestore
  - Fallback: se API falhar, não sobrescreve resultado já salvo

**Entregável:** Upgrade via Pix funcionando + resultados automáticos nos dias de jogo

---

### Semana 5 (final) · Polimento & Lançamento (~7h)
**Objetivo:** Produto pronto para usuários reais

- [ ] Landing page (`Home.jsx`) com CTA "Criar meu bolão grátis"
- [ ] Testes com grupo real (família/amigos) — pelo menos 1 bolão completo
- [ ] Ajustes de UX baseados no feedback
- [ ] Configurar domínio no Vercel
- [ ] Divulgação inicial WhatsApp / Instagram

**Entregável:** 🚀 MVP lançado com primeiros usuários reais

---

## 🤖 Cloud Function — Resultados Automáticos

```javascript
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

exports.atualizarResultados = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    const hoje = new Date().toISOString().split("T")[0]; // "2026-06-13"
    
    const response = await axios.get(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures",
      {
        params: { league: "1", season: "2026", date: hoje },
        headers: {
          "X-RapidAPI-Key": functions.config().apifootball.key,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );

    const fixtures = response.data.response;
    for (const fixture of fixtures) {
      if (fixture.fixture.status.short === "FT") {
        // Mapear ID da API para ID interno (ex: "C1", "A3")
        // Ver mapeamento em src/lib/dados.js → FIXTURE_MAP
        const jogoId = FIXTURE_MAP[fixture.fixture.id];
        if (!jogoId) continue;

        await db.collection("resultados_globais").doc(jogoId).set({
          g1: fixture.goals.home,
          g2: fixture.goals.away,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });
```

> ⚠️ **FIXTURE_MAP** precisa ser criado mapeando os IDs da API-Football para os IDs internos (A1, B2, C3...). Fazer isso na semana 5 após confirmar os IDs na API.

---

## 🔐 Regras do Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuários: só o próprio usuário lê/escreve
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Bolões: qualquer um lê, só owner escreve
    match /boloes/{bolaoId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.ownerId;

      // Participantes: qualquer um pode se adicionar
      match /participantes/{partId} {
        allow read: if true;
        allow create: if true;
      }

      // Palpites: participante escreve só os seus
      match /palpites/{partId} {
        allow read: if true;
        allow write: if request.auth == null || request.auth.uid == partId;
      }

      // Resultados: só owner do bolão (plano pro) escreve
      match /resultados/{jogoId} {
        allow read: if true;
        allow write: if request.auth.uid == get(/databases/$(database)/documents/boloes/$(bolaoId)).data.ownerId;
      }
    }
  }
}
```

---

## 🔑 Variáveis de Ambiente (.env.local)

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Admin (seu número e chave Pix)
VITE_ADMIN_WHATSAPP=55119XXXXXXXX
VITE_PIX_KEY=              # seu CPF ou número de telefone
VITE_PIX_NAME=             # seu nome completo
```

> ⚠️ Nunca commitar o `.env.local`. Já está no `.gitignore` por padrão no Vite.

---

## 📊 Métricas de Sucesso (Mês 1)

| Métrica | Meta |
|---|---|
| Bolões criados | 50 |
| Participantes únicos | 500 |
| Conversão free → Pro | 10% (5 bolões Pro) |
| Receita mês 1 | R$ 145 (5 × R$ 29) |
| Custo mensal | R$ 3 (domínio) |
| Margem | ~98% |

---

## ⚠️ Riscos & Mitigações

| Risco | Nível | Mitigação |
|---|---|---|
| Tempo escasso (1-2h/dia) | 🔴 Alto | Usar Claude Code para gerar código. Cada sessão = 1 entregável claro. |
| Janela da Copa é curta | 🔴 Alto | MVP precisa estar no ar até 11 Jun. Priorizar semanas 1-4. |
| Complexidade do Firebase | 🟡 Médio | Você já tem experiência (Boletim Digital / app de votação). Reutilizar padrões. |
| Ativação manual do Pro vira gargalo | 🟢 Baixo | OK para MVP. Automatizar via webhook Pix se volume crescer. |
| API-Football fora do ar | 🟡 Médio | Manter fallback manual no admin. Admin insere resultado se API falhar. |

---

## ✅ Checklist Pré-Desenvolvimento

Antes de rodar o Claude Code, confirme:

- [ ] Node.js 18+ instalado (`node -v`)
- [ ] Git instalado (`git --version`)
- [ ] VSCode instalado
- [ ] Claude Code instalado (`npm install -g @anthropic-ai/claude-code`)
- [ ] Conta GitHub criada
- [ ] Projeto Firebase criado (console.firebase.google.com)
  - [ ] Firestore ativado (modo teste por ora)
  - [ ] Authentication ativado (provedor Google habilitado)
  - [ ] Functions ativado (plano Blaze — necessário para Cloud Functions)
- [ ] Conta Vercel criada e conectada ao GitHub
- [ ] Conta RapidAPI criada + API-Football inscrito (plano grátis)
- [ ] Chave Pix definida (CPF ou telefone)
- [ ] Número WhatsApp do admin anotado

---

## 🚀 Primeiro Comando no Claude Code

Quando tudo estiver pronto, abra o terminal na pasta do projeto e diga:

```
Leia o arquivo PLANO.md e me ajude a executar a Semana 1 do roadmap.
Crie a estrutura do projeto React + Vite, configure o Firebase 
e implemente o login com Google. As credenciais do Firebase estão 
no .env.local. Siga exatamente a estrutura de pastas do plano.
```

---

*Gerado com Claude · Bolão Copa 2026 SaaS · Junho 2026*
