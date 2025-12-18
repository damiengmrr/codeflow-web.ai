![CodeFlow Logo](./frontend/public/images/codeflow-logo.png)

<p align="left">
  <img src="https://img.shields.io/badge/version-Beta_0.2-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend-Next.js_+_Tailwind-000000?style=flat-square" />
  <img src="https://img.shields.io/badge/Visual_Editor-Active-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Code_Editor-Monaco-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Powered_by-Groq_AI-blue?style=flat-square" />
</p>

# CodeFlow Web

> **CodeFlow Web** est le cœur visuel de l’écosystème CodeFlow.  
Il permet de **générer**, **éditer visuellement** et **modifier en code** des sites web modernes à partir d’un simple prompt.

---

## 🧠 Concept

CodeFlow Web combine **IA + éditeur no-code + mode développeur** dans une seule interface :

- Génération automatique de sites web complets
- Éditeur visuel type **Wix / Webflow**
- Mode **Code** avancé (Monaco Editor)
- Synchronisation via un **schéma JSON central**
- Prévisualisation temps réel

Objectif :  
👉 *Créer un site premium fonctionnel en quelques minutes, sans sacrifier la qualité technique.*

---

## ✨ Fonctionnalités clés

### 🔹 Génération IA
- Compréhension du brief utilisateur
- Création des pages, sections, styles et routes
- UI/UX moderne et cohérente
- Structure prête à la production

### 🔹 Éditeur visuel
- Modification du contenu (textes, images, couleurs)
- Drag & drop des sections
- Ajout de blocs prédéfinis :
  - Hero
  - Features
  - Pricing
  - FAQ
  - Contact
- Sauvegarde automatique dans un **schema JSON**

### 🔹 Mode Code
- Édition directe des fichiers
- Monaco Editor (VS Code-like)
- Navigation par fichiers
- Sync temps réel avec l’éditeur visuel

---

## 🧱 Stack technique

- **Next.js** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Monaco Editor**
- **Groq API** (LLM)
- JSON Schema centralisé

---

## 🚀 Installation locale

```bash
git clone https://github.com/damiengmrr/codeflow-web.git
cd codeflow-web/saas-builder
npm install
npm run dev