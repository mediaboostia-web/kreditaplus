# Kredita — Le crédit en toute confiance

> Application SaaS mobile-first conçue pour aider les petits commerces en Afrique à gérer leurs ventes à crédit, suivre les remboursements partiels et envoyer des relances WhatsApp personnalisées.

---

## 📌 Fonctionnalités MVP

- **Tableau de bord financier en temps réel :**
  - Montant total encore dû par les clients
  - Montant total remboursé sur la période
  - Nombre de clients avec un solde débiteur
  - Alertes pour crédits en retard et échéances proches (&lt; 3 jours)
  - Dernières opérations enregistrées
- **Gestion des fiches clients :**
  - Fiche détaillée, coordonnées et historique complet
  - Recherche instantanée par nom ou numéro de téléphone
  - Calcul du solde en temps réel dérivé strictement des transactions
  - Statuts automatiques : *Soldé*, *À jour*, *Bientôt dû*, *En retard*
  - Archivage sans perte des données comptables
- **Crédits et Remboursements :**
  - Montants entiers strictement positifs basés sur des unités monétaires mineures (pas de nombres flottants pour les calculs financiers)
  - Remboursements partiels acceptés
  - **Protection stricte** : rejet immédiat de tout remboursement supérieur au solde restant dû
  - Moyens de paiement multiples : Espèces, Mobile Money (Wave, Orange Money, etc.), Virement, Autre
  - Clés d'idempotence pour prévenir les doublons de soumission
- **Relances WhatsApp intelligentes :**
  - Préremplissage du message personnalisé conforme :
    > *« Bonjour [nom], selon le suivi de [commerce], il vous reste [montant] à régler. Vous pouvez nous contacter pour convenir du paiement. Merci. »*
  - Normalisation et validation du numéro de téléphone avec indicatif pays
  - Message clair si le client n'a pas de numéro enregistré (pas de bouton trompeur)
  - Le commerçant vérifie et expédie lui-même le message sur WhatsApp
- **Isolation Multi-Tenant :**
  - Cloisonnement strict des données par commerce
  - Vérification de l'appartenance au commerce à chaque requête
- **Préférences de communication & Lumail.io :**
  - Séparation stricte entre les emails transactionnels et les communications marketing
  - Inscription uniquement sur consentement explicite (opt-in)
  - Horodatage et traçabilité de la source de consentement
  - Possibilité de désabonnement en un clic
  - Détection automatique de la présence de `LUMAIL_API_KEY` (mode préparé gracieux si non configuré)

---

## 🎨 Identité Visuelle & Charte Kredita

Conforme aux directives strictes de la charte de marque :
- **Vert très sombre** : `#0F2327` (textes, boutons dark, structure)
- **Vert principal** : `#0CA770` (boutons d'action, accents, succès)
- **Vert menthe** : `#B4F5D8` (badges, surbrillances douces)
- **Blanc cassé** : `#F8FAF9` (arrière-plan principal doux et lisible)
- **Filtre anti-clichés appliqué** : interface claire et fonctionnelle, typographie éditoriale lisible, aucun glassmorphism générique, aucune bordure néon, aucune sphère 3D ni icône étincelle décorative.

Les ressources web optimisées ont été extraites fidèlement des fichiers de marque d'origine :
- `public/kredita-logo.png`
- `public/favicon.ico`
- `public/favicon-192.png`
- `public/icon-512.png`

---

## 🛠 Stack Technique

- **Framework frontend & routing** : TanStack Start & React 19
- **Typage** : TypeScript en mode strict
- **Backend & Base de données réactive** : Convex (`convex/schema.ts`, `businesses.ts`, `customers.ts`, `transactions.ts`, `analytics.ts`, `marketing.ts`)
- **Authentification & Sessions** : Better Auth avec support OAuth préparé
- **Composants d'interface** : Base UI avec Tailwind CSS
- **Marketing & Newsletters** : Lumail.io (API REST & intégration MCP)
- **Déploiement & Hébergement** : Cloudflare Pages / Workers (`wrangler.jsonc`)
- **Intégration Continue (CI)** : GitHub Actions (`.github/workflows/ci.yml`)

---

## 🚀 Installation et Lancement Local

### Prérequis
- Node.js version 22+ ou 24+
- `pnpm` (version 11+)
- CLI installés sur la machine :
  - **Convex CLI** : `convex` (installé)
  - **GitHub CLI** : `gh` (installé et connecté)
  - **Cloudflare CLI** : `wrangler` (installé)

### 1. Cloner et installer les dépendances
```bash
git clone <votre-depot>
cd business
pnpm install
```

### 2. Variables d'environnement
Copiez le fichier d'exemple et configurez vos clés :
```bash
cp .env.example .env.local
```

Renseignez les variables nécessaires :
```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Better Auth
BETTER_AUTH_SECRET=your_secret_32_characters_minimum
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Facultatif en local)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Lumail.io (Facultatif, active la synchronisation live)
LUMAIL_API_KEY=your_lumail_key
VITE_LUMAIL_API_KEY=your_lumail_key
```

### 3. Lancer Convex en local
```bash
pnpm run convex:dev
```

### 4. Démarrer le serveur de développement
```bash
pnpm run dev
```
L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🧪 Vérifications et Tests

Pour exécuter la suite de tests automatisant les 8 parcours obligatoires :
```bash
node --experimental-strip-types test-flows.ts
```

Résultats vérifiés :
- [x] 1. Création d'un compte et configuration du commerce
- [x] 2. Création et gestion des fiches clients
- [x] 3. Enregistrement d'un crédit client
- [x] 4. Remboursement partiel
- [x] 5. Calcul exact du solde et refus strict des trop-perçus
- [x] 6. Isolation multi-tenant (accès inter-commerces interdit)
- [x] 7. Génération du lien WhatsApp et gestion des numéros manquants
- [x] 8. Consentement explicite Lumail.io et désabonnement

---

## ☁️ Déploiement Cloudflare & GitHub

### GitHub CLI
GitHub CLI est configuré avec votre compte connecté :
- Compte actif : `mediaboostia-web`
- Droits : `repo`, `workflow`, `read:org`, `gist`

Pour publier la première version sur votre compte GitHub (sur votre autorisation explicite) :
```bash
gh repo create kredita --public --source=. --remote=origin --push
```

### Cloudflare Pages
Le projet contient la configuration `wrangler.jsonc` prête pour Cloudflare Pages :
```bash
pnpm run build
wrangler pages deploy dist --project-name=kredita
```
*(Aucun déploiement externe ni modification DNS n'est réalisé sans demande explicite).*
