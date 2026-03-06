🧠 SSP — Smart Systems Platform<p align="center"><b>Public Safety and Transparency Portal Prototype</b>Full-Stack Web Development Project • Node.js • Express • JavaScript • UI/UX</p><p align="center"><img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square"/><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"/><img src="https://img.shields.io/badge/Main_Language-English-lightgrey?style=flat-square"/><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white"/></p>🌍 OverviewSSP (Smart Systems Platform) is a full-stack academic project developed as part of a Computer Science program.It simulates a Public Safety and Transparency Portal, integrating front-end interfaces for citizen reporting, live monitoring, and administrative dashboards with a robust back-end API for data management.The project bridges the gap between front-end technologies (HTML5, CSS3, JavaScript) and back-end engineering (Node.js, Express), utilizing JSON-based persistence to demonstrate core concepts of CRUD operations, API integration, and asynchronous programming.🧩 Objective: To create a realistic, educational prototype that connects civic technology with modern web development fundamentals.⚙️ Tech StackCategoryTechnologyBack-endNode.js + Express.jsPersistenceJSON File System (Simulated Database)Front-endJavaScript (ES6+), HTML5, CSS3API ArchitectureRESTful principlesDevOps & ToolsGit, GitHub, Postman/Insomnia🧱 Project ArchitecturePlaintextSSP/
│
├── src/
│   ├── back-end/
│   │   ├── controllers/
│   │   │   ├── controlCom.js (Communications/News API)
│   │   │   └── controlUs.js (User Management API)
│   │   ├── storage/ (JSON Data Layer)
│   │   │   ├── analyses.json | cameras.json | users.json
│   │   ├── utils.js (I/O Utility functions)
│   │   ├── app.js (Express Server Entry Point)
│   │   └── package.json
│   │
│   ├── front-end/
│   │   ├── function/ (Client-side Logic)
│   │   │   ├── mapScript.js | script.js | anaScript.js
│   │   ├── pages/ (Application Views)
│   │   ├── stylo/ (CSS Architecture)
│   │   └── index.html (Main Entry)
│
└── README.md
🚀 Key Features ImplementedReal-time Camera Simulation: Dynamic listing via /api/cameras with YouTube-based video previews.Public Reporting System: Integrated reporting forms allowing citizens to submit geo-located incidents.Administrative Dashboard: A "Committee" area designed to manage camera status and public news.Data Persistence: CRUD operations handled through a centralized storage logic using JSON files for lightweight prototyping.🛠️ Installation & SetupPrerequisitesNode.js (LTS version recommended)GitStep-by-Step ExecutionClone the repository:Bashgit clone https://github.com/Dani3773/SSP.git
cd SSP/src/back-end
Install dependencies:Bashnpm install
Start the server:Windows: Run .\start.bat or node app.jsmacOS/Linux: Run node app.jsAccess the application:Open your browser and navigate to http://localhost:3000/pages/mapdex.html🧑‍💻 Development TeamDaniel Felisberto dos Santos — Back-end Architecture, API Integration, & Version Control.Gustavo Marcelino — Front-end Design & UI Scripting.Igor Rayciky — Interactivity & Code Refinement.Lucas Guollo — Interface Support & Prototyping.📜 LicenseDistributed under the MIT License. Free for academic and educational use.
