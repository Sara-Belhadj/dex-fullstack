
<?php
$pageTitle = "Administration - Dex";
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <header>
        <h1>Dex</h1>

        <nav>
            <a href="index.php">Accueil</a>
            <a href="admin.php">Administration</a>
        </nav>
    </header>

    <main>
        <h2>Espace enseignant</h2>
        <p>Connectez-vous pour gérer vos travaux et vos créneaux.</p>

        <div id="app">

            <!-- Formulaire de connexion -->
            <form v-if="!connecte" class="login-form" @submit.prevent="connexion">
                <h3>Connexion enseignant</h3>
                <p>Accédez à votre espace de gestion.</p>

                <div class="form-group">
                    <label for="identifiant">Identifiant</label>
                    <input
                        id="identifiant"
                        type="text"
                        v-model="identifiant"
                        placeholder="Votre identifiant"
                        autocomplete="username"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="motDePasse">Mot de passe</label>
                    <input
                        id="motDePasse"
                        type="password"
                        v-model="motDePasse"
                        placeholder="Votre mot de passe"
                        autocomplete="current-password"
                        required
                    >
                </div>

                <button type="submit" class="login-submit" :disabled="chargement">
                    {{ chargement ? "Connexion..." : "Se connecter" }}
                </button>

                <p v-if="erreur" class="form-error">{{ erreur }}</p>
            </form>

            <!-- Tableau de bord enseignant -->
            <section v-else class="admin-dashboard">

                <div class="admin-heading">
                    <span class="admin-label">ESPACE ENSEIGNANT</span>

                    <h2>Bonjour, {{ nomEnseignant }}</h2>
                    <p>Gérez vos travaux et leurs disponibilités.</p>
                    <button type="button" class="logout-button" @click="deconnexion">Se déconnecter</button>
                </div>

                <p v-if="chargementTravaux">Chargement des travaux...</p>

                <p v-else-if="erreurTravaux" class="form-error">{{ erreurTravaux }}</p>
                <div v-else-if="travaux.length === 0" class="admin-empty">Aucun travail à afficher.</div>
                <div v-else class="admin-works-grid">

                    <article v-for="travail in travaux" :key="travail.id" class="admin-work-card">
                        <span class="course-badge">{{ travail.cours_id }}</span>
                        <h3>{{ travail.titre }}</h3>
                        <p>{{ travail.description }}</p>
                        <span class="admin-work-status">{{ travail.ouvert ? "Ouvert" : "Fermé" }}</span>
                    </article>
                </div>
            </section>
        </div>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>

    <!-- Scripts -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="js/config.js"></script>
    <script src="js/api.js"></script>
    <script src="js/admin.js"></script>

</body>
</html>
