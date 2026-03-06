# SSP — Smart Systems Platform
## Public Safety and Transparency Portal Prototype
### Full-Stack Web Development Project | Node.js | Express | JavaScript

---

## Overview

SSP (Smart Systems Platform) is a full-stack academic project developed as part of a Computer Science program. It simulates a Public Safety and Transparency Portal, integrating front-end interfaces for citizen reporting, live monitoring, and administrative dashboards with a robust back-end API for data management.

The project bridges the gap between front-end technologies (HTML5, CSS3, JavaScript) and back-end engineering (Node.js, Express), utilizing JSON-based persistence to demonstrate core concepts of CRUD operations, API integration, and asynchronous programming.

The primary objective is to create a realistic, educational prototype that connects civic technology with modern web development fundamentals.

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Back-end | Node.js + Express.js |
| Persistence | JSON File System (Simulated Database) |
| Front-end | JavaScript (ES6+), HTML5, CSS3 |
| API Architecture | RESTful principles |
| DevOps & Tools | Git, GitHub, Postman/Insomnia |

---

## Project Architecture

SSP/
│
├── src/
│   ├── back-end/
│   │   ├── controllers/
│   │   │   ├── controlCom.js (Communications/News API)
│   │   │   └── controlUs.js (User Management API)
│   │   ├── storage/ (JSON Data Layer)
│   │   │   ├── analyses.json
│   │   │   ├── cameras.json
│   │   │   └── users.json
│   │   ├── utils.js (I/O Utility functions)
│   │   ├── app.js (Express Server Entry Point)
│   │   └── package.json
│   │
│   ├── front-end/
│   │   ├── function/ (Client-side Logic)
│   │   │   ├── mapScript.js
│   │   │   ├── script.js
│   │   │   └── anaScript.js
│   │   ├── pages/ (Application Views)
│   │   ├── stylo/ (CSS Architecture)
│   │   └── index.html (Main Entry)
│
└── README.md

---

## Key Features Implemented

- Real-time Camera Simulation: Dynamic listing via /api/cameras with YouTube-based video previews.
- Public Reporting System: Integrated reporting forms allowing citizens to submit geo-located incidents.
- Administrative Dashboard: A "Committee" area designed to manage camera status and public news.
- Data Persistence: CRUD operations handled through a centralized storage logic using JSON files for lightweight prototyping.

---

## Installation & Setup

### Prerequisites
- Node.js (LTS version recommended)
- Git

### Step-by-Step Execution
1. Clone the repository:
   git clone https://github.com/Dani3773/SSP.git
   cd SSP/src/back-end

2. Install dependencies:
   npm install

3. Start the server:
   - Windows: Run .\start.bat or node app.js
   - macOS/Linux: Run node app.js

4. Access the application:
   Open your browser and navigate to http://localhost:3000/pages/mapdex.html

---

## Development Team

- Daniel Felisberto dos Santos — Back-end Architecture, API Integration, & Version Control.
- Gustavo Marcelino — Front-end Design & UI Scripting.
- Igor Rayciky — Interactivity & Code Refinement.
- Lucas Guollo — Interface Support & Prototyping.

---

## License
Distributed under the MIT License. Free for academic and educational use.
