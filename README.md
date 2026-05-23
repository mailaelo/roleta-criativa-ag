# 🎨 Roleta Criativa

Bem-vindo(a) ao **Roleta Criativa**! Um aplicativo projetado para ajudar artistas e entusiastas a praticarem diversas habilidades artísticas, como desenho, pintura, escultura, etc., escolhendo referências aleatórias do Google Drive e acompanhando sua jornada de estudos.

🚀 *Este projeto foi construído inteiramente na IDE **Antigravity** com a ajuda do assistente de inteligência artificial.*

---

## 🎯 Funcionalidades

- **Sorteio Aleatório de Referências:** Insira uma pasta pública do Google Drive para sortear imagens ou vídeos para suas sessões de estudo ou passatempo.
- **Rastreador de Humor e Tags:** Registre como você se sentiu após cada sessão e adicione tags sobre as habilidades praticadas (ex: anatomia, cores).
- **Dashboard Analítico:** Acompanhe suas estatísticas (ofensivas, horas gastas) através de gráficos visuais (tags mais usadas e evolução de humor).

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Vite, TypeScript, WebAwesome Components, Chart.js.
- **Backend:** Node.js, Express (para integração segura com a Google Drive API).
- **Banco de Dados:** Firebase (Authentication e Cloud Firestore).
- **Analytics Avançado:** Google BigQuery (via Firebase Extensions).


## ☁️ Deploy

Arquitetura de hospedagem:
- **Frontend:** Firebase Hosting (Classic).
- **Backend (API):** Google Cloud Run (usando o `Dockerfile` incluso).

---

