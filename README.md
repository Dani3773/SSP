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
- **Node.js** installed (download from [nodejs.org](https://nodejs.org/))

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

<p align="center"> <i>Desenvolvido colaborativamente por Daniel, Gustavo, Igor e Lucas — 2025.</i><br> <b>Smart Systems Platform • Protótipo Acadêmico</b> </p>
