<!-- HEADER -->
<h1 align="center">🧠 SSP — Smart Systems Platform</h1>
<p align="center">
  <b>Protótipo de Sistema de Segurança Pública e Transparência</b><br>
  Projeto Acadêmico de Desenvolvimento Web Full-Stack • HTML • CSS • JavaScript • Node.js
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-ativo-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/badge/licença-MIT-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/idioma-Português-lightgrey?style=flat-square"/>
</p>

---

## 🌍 Visão Geral

**SSP (Smart Systems Platform)** é um projeto web acadêmico desenvolvido como parte de um **programa de Ciência da Computação**.  
Ele simula um **Portal Público de Segurança e Transparência**, integrando páginas front-end para **denúncias cidadãs, monitoramento ao vivo e dashboards administrativos** com uma **API back-end para gerenciamento de dados**.

O projeto combina **tecnologias front-end (HTML, CSS, JavaScript)** com **back-end (Node.js, Express)**, utilizando JSON para armazenamento de dados, focando no desenvolvimento full-stack, interatividade e trabalho em equipe.

> 🧩 O objetivo é criar um protótipo realista e educacional que conecta tecnologia cívica com fundamentos modernos de desenvolvimento web.

---

## 🎯 Propósito

O SSP representa como **tecnologias web** podem ser usadas para promover **transparência digital, engajamento público e accountability**.  
Também é um **ambiente de aprendizado prático** para construir, organizar e testar aplicações web full-stack de forma colaborativa.

---

## ⚙️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|-------------|
| Estrutura Front-end | **HTML5** |
| Estilo Front-end | **CSS3** |
| Lógica/Interação Front-end | **JavaScript (ES6)** |
| Back-end | **Node.js + Express.js** |
| Armazenamento de Dados | **Arquivos JSON** |
| Colaboração | **Git + GitHub** |
| Prototipagem | **Mockups, Telas, Conceitos de UI** |

---

## 🧑‍💻 Desenvolvedores

| Nome | Função |
|------|--------|
| **Daniel Felisberto dos Santos** | Back-end, front-end, desenvolvimento de API, integração, controle de versão |
| **Gustavo Marcelino** | Front-end, design, prototipagem, scripting |
| **Igor Rayciky** | Front-end, interatividade, testes, refinamento de código |
| **Lucas Guollo** | Front-end, prototipagem, suporte de interface, ajustes |

> Todos os quatro desenvolvedores trabalham igualmente em todo o projeto — do UI front-end às APIs back-end.

---

## 🧱 Estrutura do Projeto

SSP/
│
├── src/
│ ├── back-end/
│ │ ├── controllers/
│ │ │ ├── controlCom.js (API para comunicações/notícias)
│ │ │ └── controlUs.js (API para usuários)
│ │ ├── storage/
│ │ │ ├── analyses.json
│ │ │ ├── cameras.json
│ │ │ ├── media.json
│ │ │ ├── news.json
│ │ │ └── users.json
│ │ ├── utils.js (utilitários para arquivos JSON)
│ │ ├── app.js (servidor Express)
│ │ ├── package.json
│ │ └── start.bat (script de inicialização Windows)
│ ├── front-end/
│ │ ├── function/
│ │ │ ├── script.js (scripts principais de UI)
│ │ │ ├── comdex.js
│ │ │ ├── mapScript.js
│ │ │ ├── noticiasScript.js
│ │ │ └── anaScript.js
│ │ ├── img/ (imagens)
│ │ ├── pages/ (páginas adicionais)
│ │ ├── stylo/ (folhas de estilo)
│ │ └── index.html (página principal)
│
├── protótipo/
│ ├── screenshots & vídeos
│
└── README.md

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** instalado (baixe em [nodejs.org](https://nodejs.org/))

### Configuração e Execução
```bash
git clone https://github.com/Dani3773/SSP.git
cd SSP/src/back-end
npm install  # Instalar dependências
npm start    # Ou use: .\start.bat (Windows)
```

Em seguida, abra `http://localhost:3000` no navegador.

> **Nota**: No Windows, se `npm` não estiver no PATH, use `.\start.bat` ou `& 'C:\Program Files\nodejs\node.exe' app.js`

---

🧭 Status do Projeto
🟡 Desenvolvimento Ativo
Front-end e back-end integrados. Novos recursos, melhorias e APIs estão sendo continuamente adicionados.

---

📜 Licença
Distribuído sob a Licença MIT — gratuito para uso acadêmico e educacional.
Sinta-se à vontade para explorar, fazer fork e aprender.

<p align="center"> <i>Desenvolvido colaborativamente por Daniel, Gustavo, Igor e Lucas — 2025.</i><br> <b>Smart Systems Platform • Protótipo Acadêmico</b> </p>> All four developers work equally across the entire project — from HTML and CSS to JavaScript logic and UI prototyping.

---

## 🧱 Project Structure

SSP/
│
├── src/
│ ├── back-end/
│ │ ├── controllers/
│ │ │ ├── controlCom.js (API para comunicações/notícias)
│ │ │ └── controlUs.js (API para usuários)
│ │ ├── storage/
│ │ │ ├── analyses.json
│ │ │ ├── cameras.json
│ │ │ ├── media.json
│ │ │ ├── news.json
│ │ │ └── users.json
│ │ ├── utils.js (utilitários para arquivos JSON)
│ │ ├── app.js (servidor Express)
│ │ ├── package.json
│ │ └── start.bat (script de inicialização Windows)
│ ├── front-end/
│ │ ├── function/
│ │ │ ├── script.js (scripts principais de UI)
│ │ │ ├── comdex.js
│ │ │ ├── mapScript.js
│ │ │ ├── noticiasScript.js
│ │ │ └── anaScript.js
│ │ ├── img/ (imagens)
│ │ ├── pages/ (páginas adicionais)
│ │ ├── stylo/ (folhas de estilo)
│ │ └── index.html (página principal)
│
├── protótipo/
│ ├── screenshots & videos
│
└── README.md

---

## 🚀 How to Run

### Prerequisites
**(arquivo README substituído por resumo atualizado com instruções de execução e estado do projeto)**

# SSP — Smart Systems Platform

Protótipo de um Portal de Segurança Pública e Transparência — projeto acadêmico full‑stack (HTML/CSS/JS + Node.js).

Status atual (resumo):
- Front-end: páginas públicas (mapa, listagem de câmeras, formulário de denúncia, notícias) com integração a scripts em `src/front-end/function`.
- Back-end: servidor Express em `src/back-end/app.js` com armazenamento em JSON (`src/back-end/storage/*`).
- Funcionalidades chave já implementadas: listagem de câmeras via `/api/cameras`, formulário de denúncia integrado à página do mapa, previews por câmera (YouTube demoVideoId), e área administrativa do Comitê para gerenciar câmeras.

Este README explica como preparar e executar o projeto localmente, além de detalhes úteis para desenvolvedores que entrem no time.

---

## Estrutura principal

Resumo dos diretórios importantes:

- `src/back-end/` — servidor Express, controllers, utilitários e `start.bat` (Windows).
- `src/back-end/storage/` — arquivos JSON que simulam o banco de dados (cameras.json, users.json, news.json, etc.).
- `src/front-end/` — código público servido (páginas, estilos e scripts).
  - `src/front-end/pages/` — páginas HTML (ex.: `mapdex.html`).
  - `src/front-end/stylo/` — CSS.
  - `src/front-end/function/` — scripts JS (ex.: `mapScript.js`, `script.js`).

---

## Pré-requisitos (o que seus colegas precisam ter no computador)

- Windows, macOS ou Linux.
- Node.js (versão LTS recomendada). Verifique com:

```powershell
node -v
npm -v
```

- Git (para clonar o repositório) — opcional se já tiver os arquivos.

Observação: o repositório inclui um `start.bat` para iniciar o servidor no Windows. Para macOS/Linux, usar `node app.js` diretamente.

---

## Como rodar o projeto (passo a passo)

1) Clone o repositório (ou garanta que o diretório `SSP` já esteja local):

```powershell
git clone https://github.com/Dani3773/SSP.git
cd SSP/src/back-end
```

2) Instale dependências (se houver `package.json` com dependências):

```powershell
npm install
```

3) Inicie o servidor (duas opções):

- Windows (recomendado para time Windows):

```powershell
.\start.bat
```

- Ou usando Node diretamente (funciona em qualquer SO):

```powershell
node app.js
```

4) Abra o navegador e acesse:

```
http://localhost:3000/pages/mapdex.html
```

ou a raiz `http://localhost:3000` dependendo do que você quiser ver.

Observações úteis:
- Se o servidor já estiver rodando e você alterar arquivos do front-end (HTML/CSS/JS), basta recarregar a página no navegador.
- Se alterar código do back-end, reinicie o servidor (feche o processo e rode `start.bat` ou `node app.js` novamente). Recomendo usar `nodemon` em desenvolvimento (instalar globalmente `npm i -g nodemon` e rodar `nodemon app.js`).

---

## Endpoints principais (úteis para testes)

- `GET /api/cameras` — lista as câmeras (JSON).
- `POST /api/cameras` — criar/atualizar câmera (usado pela área do Comitê).
- `POST /api/denuncias` — endpoint que recebe denúncias (o front-end envia o formulário).
- `GET /api/communications` — notícias/comunicações públicas.

Abra `src/back-end/app.js` para ver portas e rotas atuais (por padrão usa `3000`).

---

## Dicas rápidas para colaboradores

- Edição local: edite arquivos em `src/front-end/pages/` ou `src/front-end/function/` e recarregue o navegador.
- Testes de API: use `curl` ou o Insomnia/Postman para checar `GET /api/cameras`.
- Commit/push: siga a convenção do time (commit messages curtos). Exemplo:

```powershell
git add .
git commit -m "feat(map): atualiza layout da página de mapa"
git push origin main
```

---

## Situação atual / Pendências conhecidas

- Formulário de denúncia copiado para a página do mapa e estilizado; seleção de câmera via `datalist` implementada.
- Preview por câmera suporta `demoVideoId` (YouTube) salvo em `cameras.json` pelo painel do Comitê.
- Ajustes de layout recentes: largura do formulário, alinhamento das colunas, linha divisória entre colunas e espaçamento ao rodapé.
- Pendências úteis a implementar (exemplos): validação avançada do formulário no front-end, persistência real em banco (em vez de JSON), testes automatizados e autenticação para a área do Comitê.

---

## Problemas comuns / Soluções

- Se a página não atualizar depois de editar CSS/JS, force reload (Ctrl+F5) ou limpe cache do navegador.
- Se `start.bat` não executar, abra PowerShell no diretório `src/back-end` e rode `node app.js`.
- Se a porta 3000 já estiver em uso, edite `src/back-end/app.js` e altere a porta.

---

## Contato

Para dúvidas de desenvolvimento, contacte **Daniel Felisberto** (responsável pelo repositório) ou abra uma issue no GitHub.

---

_README atualizado em 21/11/2025 — descreve o estado atual do protótipo e instruções básicas para executar o projeto localmente._
