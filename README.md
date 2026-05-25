# 📡 JobRadar : Outil Intelligent de Veille d'Emploi Automatique 🚀

**JobRadar** est une application full-stack premium conçue pour automatiser la recherche quotidienne d'offres d'emploi et envoyer des alertes directes sur votre **Telegram**. 

L'application est optimisée pour vos critères professionnels :
- **Domaines cibles :** Big Data (Spark, Kafka), DevOps (Docker, Kubernetes, Terraform), Cloud (AWS, Azure), Observabilité (ELK Stack, Grafana, Prometheus), Java / Spring Boot, et React.
- **Pays cibles :** Maroc 🇲🇦, France 🇫🇷, Canada 🇨🇦 (et d'autres pays).
- **Sources multiples :** Jooble API, Adzuna API, LinkedIn, Indeed, Rekrute (Maroc), Flux RSS universels.

---

## ⚡ Deux Modes de Fonctionnement

### 1. Mode Serverless & Gratuit (GitHub Actions + GitHub Pages) — Recommandé ! 💎
Aucun serveur à payer ni à configurer. L'application tourne 100% gratuitement dans le cloud :
- **Scraping quotidien automatisé :** Exécuté par **GitHub Actions** chaque matin (Cron à 8h UTC) ou déclenché manuellement. Il cherche les nouvelles offres, filtre, dédoublonne, vous alerte sur **Telegram**, enregistre les offres dans `jobs.json` et pousse les modifications dans votre dépôt.
- **Dashboard interactif :** Hébergé gratuitement sur **GitHub Pages**. Vos graphiques et offres se mettent à jour automatiquement chaque jour sans aucune action de votre part !

### 2. Mode Local (Serveur Express + SQLite + React) 🛠️
Pour tester sur votre machine, faire des modifications immédiates ou exécuter un serveur en tâche de fond sur votre PC/VPS.

---

## 🏗️ Structure du Projet

```text
GET ALL OFFERS JOB/
├── .github/workflows/
│   └── jobradar.yml         # Planificateur quotidien et déploiement GitHub Actions
├── backend/
│   ├── database/
│   │   └── db_manager.js    # Gestionnaire hybride SQLite / Flat JSON
│   ├── notifier/
│   │   └── telegram.js      # Formateur de rapports esthétiques Telegram
│   ├── scrapers/
│   │   ├── adzuna.js, jooble.js, rekrute_scraper.js, linkedin_scraper.js,
│   │   ├── indeed_scraper.js, rss_scraper.js, mock_scraper.js,
│   │   └── scraper_manager.js # Centralisation de la recherche multi-sources
│   ├── scripts/
│   │   └── cron-scrape.js   # Script autonome de veille quotidien
│   ├── server.js            # API REST Express locale
│   └── package.json
├── frontend/
│   ├── public/data/
│   │   ├── jobs.json        # Base de données plate statique
│   │   └── config.json      # Réglages de recherche (mots-clés, pays)
│   ├── src/
│   │   ├── components/      # Sidebar, Dashboard, Radar, JobsBoard, Config
│   │   ├── App.jsx          # Cœur de l'application
│   │   ├── index.css        # Styles HSL premium & Glassmorphism
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Démarrage en Mode Local

### Étape 1 : Lancer le Backend
1. Ouvrez un terminal dans le dossier `backend` :
   ```bash
   cd backend
   npm install
   ```
2. Créez un fichier `.env` dans le dossier `backend` :
   ```env
   PORT=3001
   TELEGRAM_BOT_TOKEN=votre_token_bot
   TELEGRAM_CHAT_ID=votre_chat_id
   JOOBLE_API_KEY=votre_cle_api_jooble (Optionnel)
   ADZUNA_APP_ID=votre_app_id_adzuna (Optionnel)
   ADZUNA_APP_KEY=votre_app_key_adzuna (Optionnel)
   ```
3. Démarrez le serveur :
   ```bash
   npm start
   ```

### Étape 2 : Lancer le Frontend React
1. Ouvrez un second terminal dans le dossier `frontend` :
   ```bash
   cd frontend
   npm install
   ```
2. Démarrez l'application web :
   ```bash
   npm run dev
   ```
3. Ouvrez votre navigateur sur `http://localhost:3000`.

---

## ☁️ Déploiement Serverless Gratuit (GitHub)

Suivez ces 4 étapes simples pour automatiser votre veille d'emploi à vie :

### Étape 1 : Créer votre Dépôt GitHub
1. Créez un nouveau dépôt **privé** ou **public** sur votre compte GitHub (nommé par exemple `jobradar`).
2. Poussez le code de votre dossier local vers ce dépôt :
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of JobRadar"
   git branch -M main
   git remote add origin https://github.com/VOTRE_PSEUDO/jobradar.git
   git push -u origin main
   ```

### Étape 2 : Configurer les Secrets GitHub (Sécurité des jetons)
1. Allez sur l'onglet **Settings** de votre dépôt GitHub.
2. Dans le menu de gauche, cliquez sur **Secrets and variables** > **Actions**.
3. Ajoutez deux **Repository Secrets** :
   - `TELEGRAM_BOT_TOKEN` : Le jeton obtenu en parlant à `@BotFather` sur Telegram.
   - `TELEGRAM_CHAT_ID` : Votre identifiant de discussion obtenu avec `@userinfobot` ou l'ID de votre canal public/privé.
   - *(Optionnel)* : Ajoutez vos clés d'API `JOOBLE_API_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` si vous en possédez pour faire de vraies requêtes d'API supplémentaires !

### Étape 3 : Autoriser l'écriture dans le Dépôt
Le robot doit pouvoir commiter la base de données `jobs.json` mise à jour dans votre dépôt :
1. Dans l'onglet **Settings** de votre dépôt, allez dans **Actions** > **General**.
2. Faites défiler vers le bas jusqu'à la section **Workflow permissions**.
3. Sélectionnez **Read and write permissions** et cochez **Allow GitHub Actions to create and approve pull requests**.
4. Cliquez sur **Save**.

### Étape 4 : Activer le Site Web (GitHub Pages)
1. Activez le déploiement sur GitHub Pages : Allez dans **Settings** > **Pages**.
2. Dans la section **Build and deployment** > **Source**, choisissez **Deploy from a branch**.
3. Choisissez la branche **`gh-pages`** (cette branche est créée automatiquement lors de la première exécution du workflow GitHub Actions) et le dossier **`/ (root)`**.
4. Cliquez sur **Save**.

🎉 **C'est fini !** Votre robot se réveillera toutes les 24 heures, scannera Indeed, LinkedIn, Rekrute, Jooble et Adzuna, vous enverra un magnifique résumé par Telegram, et mettra à jour votre tableau de bord interactif disponible en ligne gratuitement !
