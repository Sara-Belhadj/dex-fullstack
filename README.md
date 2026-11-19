# Dex — Gestion des travaux et des disponibilités

Application web développée dans le cadre du cours **Web 2 (420-248-AH)**. Dex permet aux étudiants de consulter leurs travaux et les créneaux disponibles, et aux enseignants de gérer les travaux ainsi que les disponibilités associées.

## Aperçu de l'application

### Espace étudiant

![Espace étudiant Dex](site/preview/EspaceEtudiant.png)

### Espace enseignant

![Espace enseignant Dex](site/preview/EspaceEnseignant.png)

## Fonctionnalités

### Espace étudiant
- Consultation des cours et des travaux.
- Affichage des informations et des échéances des travaux.
- Consultation des créneaux de disponibilité associés aux travaux.
- Inscription à un créneau lorsqu'il est disponible.

### Espace enseignant
- Connexion et déconnexion.
- Consultation des travaux dans un tableau de bord.
- Modification des informations d'un travail.
- Ajout, modification et suppression de créneaux horaires.
- Consultation du nombre d'étudiants inscrits à un créneau.

### Interface
- Interface responsive, claire et minimaliste.
- Navigation entre l'accueil, les travaux et l'administration.
- Défilement fluide avec Lenis.

## Technologies utilisées

| Partie | Technologies |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, PHP, Vue 3 |
| Backend | Node.js, Express |
| Base de données | MySQL |
| Authentification | bcrypt |
| Environnement local | XAMPP, npm |
| Défilement | Lenis |

## Structure du projet

```text
dex-fullstack/
├── api/                 # Serveur Express et accès à MySQL
├── site/                # Pages PHP, CSS, JavaScript et images
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── index.php        # Accueil étudiant
│   ├── travail.php      # Détails d'un travail
│   └── admin.php        # Espace enseignant
├── screenshots/         # Captures d'écran pour la documentation
│   └── homepage.png
├── init.sql             # Initialisation de la base de données
└── README.md
```

> Le dossier `screenshots/` et son image sont à créer si ce n'est pas déjà fait.

## Installation locale

### Prérequis
- Node.js et npm
- XAMPP (Apache et MySQL)
- Un navigateur web

### 1. Récupérer le projet

```bash
git clone https://github.com/Sara-Belhadj/dex-fullstack.git
cd dex-fullstack
```

Pour utiliser les URL locales indiquées ci-dessous, placer le dossier du projet dans `C:\xampp\htdocs\`.

### 2. Préparer la base de données

1. Démarrer **Apache** et **MySQL** dans XAMPP.
2. Ouvrir phpMyAdmin : `http://localhost/phpmyadmin`.
3. Créer la base de données `DexAppBD`.
4. Importer le fichier `init.sql`.

### 3. Configurer le backend

Dans le dossier `api/`, créer un fichier `.env` adapté à votre environnement local :

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=DexAppBD
PORT=3000
```

> Ces valeurs sont des exemples pour un environnement XAMPP local. Ne pas publier de véritables mots de passe ou le fichier `.env` sur GitHub.

### 4. Démarrer l'API

```bash
cd api
npm install
npm run dev
```

L'API est configurée pour fonctionner localement sur `http://localhost:3000`.

### 5. Ouvrir l'application

Avec Apache et MySQL démarrés, accéder à :

- **Espace étudiant :** `http://localhost/dex-fullstack/site/index.php`
- **Espace enseignant :** `http://localhost/dex-fullstack/site/admin.php`

Vérifier que l'URL de l'API définie dans `site/js/config.js` correspond à votre environnement.

## API

Le backend expose notamment les routes suivantes :

| Méthode | Route | Rôle |
| --- | --- | --- |
| GET | `/api` | Vérifier l'état de l'API |
| GET | `/api/cours` | Récupérer les cours |
| GET | `/api/travaux` | Récupérer les travaux |
| GET | `/api/travaux/:id/disponibilites` | Consulter les disponibilités d'un travail |
| POST | `/api/connexion` | Connecter un enseignant |
| POST | `/api/deconnexion` | Déconnecter un utilisateur |

D'autres routes permettent de gérer les travaux et les créneaux depuis l'administration.

## Contexte

Projet scolaire fullstack réalisé pour mettre en pratique la communication client-serveur, les API REST, la gestion des données MySQL et les interfaces web interactives.

## Auteur

[Sara Belhadj](https://github.com/Sara-Belhadj)
