# Fekretna — من فكرة لفريق
> *"De ton idée à ton équipe — Find the right people. Build something together."*

Fekretna est une plateforme web moderne conçue pour aider les étudiants universitaires, jeunes diplômés et entrepreneurs tunisiens (avec un ancrage initial à Sfax et une expansion à travers toute la Tunisie) à découvrir des associés aux compétences complémentaires, former des équipes et lancer des projets et startups.

---

## 1. Prérequis

- **Node.js** : version 18.18+ (testé et validé sur Node v24.x)
- **npm** : version 9+ (ou pnpm / yarn)
- **Compte Supabase** : [https://supabase.com](https://supabase.com) (version gratuite ou pro)
- **Navigateur moderne** : Chrome, Firefox, Safari ou Edge

---

## 2. Installation des dépendances

Dans le répertoire racine du projet :

```bash
npm install
```

---

## 3. Configuration des variables d'environnement

Copiez le fichier d'exemple `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Renseignez vos clés Supabase dans `.env.local` :

```env
# Clés API Supabase (disponibles dans Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://<votre-id-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-cle-anon-publique>

# Clé service-role (uniquement pour les scripts serveur sécurisés, JAMAIS exposée côté client)
SUPABASE_SERVICE_ROLE_KEY=<votre-cle-service-role>

# URL de l'application (pour les redirections d'authentification et invitations)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Sécurité :** Ne committez jamais `.env.local` dans Git. Ce fichier est déjà inclus dans `.gitignore`.

---

## 4. Création du projet Supabase

1. Connectez-vous sur [Supabase Dashboard](https://app.supabase.com).
2. Cliquez sur **"New Project"**.
3. Choisissez votre organisation, nommez le projet (ex: `fekretna-tn`), définissez un mot de passe de base de données robuste.
4. Sélectionnez la région la plus proche de la Tunisie (ex: `eu-west-1` Francfort ou `eu-central-1`).
5. Cliquez sur **"Create new project"**.

---

## 5. Application des migrations de base de données

Le schéma complet, les tables, les clés étrangères, les fonctions et l'ensemble des politiques de sécurité Row-Level Security (RLS) se trouvent dans le fichier :
[`supabase/migrations/20260917000001_initial_schema.sql`](file:///c:/antigarvity%20Projects/fekretna/supabase/migrations/20260917000001_initial_schema.sql)

### Option A — Via le SQL Editor de Supabase (Recommandé & Rapide)
1. Dans le tableau de bord Supabase, ouvrez le **SQL Editor** dans la barre latérale gauche.
2. Cliquez sur **"New query"**.
3. Copiez l'intégralité du contenu de `supabase/migrations/20260917000001_initial_schema.sql`.
4. Collez dans l'éditeur et cliquez sur **"Run"**.
5. Les tables (`profiles`, `skills`, `interests`, `projects`, `project_roles`, `connection_requests`, `conversations`, `messages`, `project_applications`, `notifications`, `blocks`, `reports`, `user_roles`) et les politiques RLS seront créées avec les données initiales de compétences et centres d'intérêt.

### Option B — Via la CLI Supabase
```bash
npx supabase db push
```

---

## 6. Configuration de l'authentification Supabase

1. Dans le tableau de bord Supabase, allez dans **Authentication** > **Providers** > **Email**.
2. Assurez-vous que l'authentification par email est activée (**Enable Email provider**).
3. *(Optionnel pour le développement)* : Vous pouvez désactiver **Confirm email** pour tester instantanément la connexion sans devoir valider l'email, ou configurer vos templates d'email personnalisés.
4. Dans **Authentication** > **URL Configuration**, ajoutez :
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : `http://localhost:3000/**`, `https://votre-domaine.tn/**`

---

## 7. Configuration du stockage (Supabase Storage)

Pour héberger les photos de profil (avatars) :
1. Dans Supabase, ouvrez **Storage** > **New Bucket**.
2. Créez un bucket public nommé `avatars` :
   - **Public bucket** : Activé
   - Taille max de fichier : `2 MB`
   - Formats autorisés : `image/jpeg, image/png, image/webp`
3. Ajoutez une politique de sécurité de stockage :
   - **Lecture** : Accessible à tous (`SELECT` -> `true`).
   - **Écriture** : Uniquement le propriétaire (`INSERT` / `UPDATE` -> `auth.uid() = (storage.foldername(name))[1]`).

---

## 8. Lancement du serveur de développement

```bash
npm run dev
```

L'application est disponible sur : [http://localhost:3000](http://localhost:3000)

---

## 9. Tests et vérification du code

### Exécution des tests unitaires (Vitest)
```bash
npm run test
```
Vérifie :
- L'algorithme de matching déterministe (complémentarité Tech + Business, affinités, proximité géographique Sfax/Tunisie).
- Les validations de formulaires Zod (inscription, création de projet, candidature, signalement).
- Les règles d'autorisation et de sécurité (auto-connexion impossible, blocage mutuel étanche).

### Vérification TypeScript
```bash
npx tsc --noEmit
```

### Vérification ESLint
```bash
npm run lint
```

---

## 10. Construction du bundle de production

```bash
npm run build
npm start
```

---

## 11. Déploiement en production

L'application est 100% compatible avec **Vercel**, **Cloudflare Pages**, ou tout serveur Node.js / Docker :

### Déploiement sur Vercel :
1. Poussez votre code sur GitHub ou GitLab.
2. Importez le projet sur [Vercel](https://vercel.com).
3. Ajoutez les variables d'environnement dans les paramètres Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ex: `https://fekretna.tn`)
4. Cliquez sur **Deploy**.

---

## 12. Attribution sécurisée du premier administrateur

Par défaut, tous les utilisateurs inscrits ont le rôle `user`. Pour promouvoir un compte administrateur en toute sécurité, exécutez la requête SQL suivante dans le SQL Editor de Supabase (jamais via le navigateur) :

```sql
-- Remplacer par l'adresse email de l'administrateur
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@fekretna.tn'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

Une fois exécutée, l'utilisateur aura accès à l'espace d'administration à l'adresse `/admin`, `/admin/reports`, `/admin/users` et `/admin/projects`.

---

## Structure du projet

```
fekretna/
├── src/
│   ├── app/                    # Pages et routes Next.js App Router
│   │   ├── (public)/           # Landing, explore, about, privacy, terms
│   │   ├── (auth)/             # login, signup, forgot-password, reset-password
│   │   ├── app/                # Espace connecté (/app/discover, projects, messages, connections, profile, settings)
│   │   ├── admin/              # Espace d'administration et modération
│   │   ├── layout.tsx          # Layout racine avec polices et métadonnées
│   │   └── globals.css         # Thème Tailwind et design tokens
│   ├── components/
│   │   ├── cards/              # ProfileCard, ProjectCard, SwipeCard
│   │   ├── discovery/          # DiscoveryFilters
│   │   ├── layout/             # Navbar, Footer, AppSidebar, MobileNav, AppNavbar
│   │   ├── modals/             # ConnectModal, ApplyModal, ReportModal
│   │   └── ui/                 # Badge, Modal, EmptyState, LoadingSkeleton
│   ├── lib/
│   │   ├── i18n.ts             # Dictionnaire français et tokens multilingues
│   │   ├── matching.ts         # Moteur de matching déterministe
│   │   ├── supabase/           # Clients Supabase (client, server, middleware, admin)
│   │   ├── utils.ts            # Utilitaires et liste des villes tunisiennes
│   │   └── validations.ts      # Schémas Zod
│   ├── types/
│   │   └── database.ts         # Types TypeScript de la base de données
├── supabase/
│   └── migrations/             # Schéma PostgreSQL et politiques RLS
├── .env.example                # Exemple des variables d'environnement
└── package.json
```
