<?php
$pageTitle = "Accueil - Dex";
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="images/favicon.png">
    <script src="https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.min.js"></script>
<script src="js/smooth-scroll.js"></script>
</head>
<body>

    <div class="hero-wrapper">
    <header>
        <h1>Dex</h1>

        <nav>
            <a href="index.php">Accueil</a>
            <a href="admin.php">Administration</a>
        </nav>
    </header>

        <section class="hero">
            <span class="hero-badge">ESPACE ÉTUDIANT</span>

            <h2 class="hero-title">
                Organisez vos travaux.<br>
                Simplifiez vos disponibilités.
            </h2>

            <p class="hero-description">
                Retrouvez vos travaux, consultez les créneaux proposés
                et indiquez vos disponibilités en quelques clics.
            </p>
        </section>

        </div> <!-- Fin hero-wrapper -->
        <main>
            <section class="works-section">
            <div class="section-heading">
                <div>
                    <span class="section-label">VOTRE ESPACE</span>
                    <h2>Travaux disponibles</h2>
                    <p>Retrouvez les travaux et les créneaux de vos cours.</p>
                </div>
            </div>

            <div id="app">
                <!-- Message pendant le chargement -->
                    <p v-if="chargement" class="loading-message">Chargement des travaux...</p>
                    <!-- Message si une erreur survient -->
                    <p v-else-if="erreur" class="error-message">{{ erreur }}</p>
                <div class="works-grid" v-else>

                    <article class="work-card" v-for="travail in travaux" :key="travail.id">
                        <div class="work-card-content">
                            <span class="course-badge">{{ travail.cours_id }}</span>
                            <h3>{{ travail.titre }}</h3>
                            <p>{{ travail.description }}</p>
                            <a class="work-card-link" :href="'travail.php?id=' + encodeURIComponent(travail.id)">Voir le travail ↗</a>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="js/config.js"></script>
    <script src="js/api.js"></script>
    <script src="js/app.js"></script>
</body>
</html>