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

        <section class="works-section">
            <div class="section-heading">
                <div>
                    <span class="section-label">VOTRE ESPACE</span>
                    <h2>Travaux disponibles</h2>
                    <p>Retrouvez les travaux et les créneaux de vos cours.</p>
                </div>
            </div>

            <div id="app">
                <div class="works-grid">

                    <article class="work-card">
                        <div class="work-card-visual visual-blue">
                            <span class="visual-symbol">01</span>
                        </div>

                        <div class="work-card-content">
                            <span class="course-badge">WEB 2</span>
                            <h3>Travail pratique 1</h3>
                            <p>Consultez les créneaux et indiquez vos disponibilités.</p>
                            <span class="work-card-link">Voir le travail →</span>
                        </div>
                    </article>

                    <article class="work-card">
                        <div class="work-card-visual visual-purple">
                            <span class="visual-symbol">02</span>
                        </div>

                        <div class="work-card-content">
                            <span class="course-badge">BASES DE DONNÉES</span>
                            <h3>Laboratoire 2</h3>
                            <p>Découvrez les détails et les créneaux disponibles.</p>
                            <span class="work-card-link">Voir le travail →</span>
                        </div>
                    </article>

                    <article class="work-card">
                        <div class="work-card-visual visual-peach">
                            <span class="visual-symbol">03</span>
                        </div>

                        <div class="work-card-content">
                            <span class="course-badge">PROJET FINAL</span>
                            <h3>Présentation du prototype</h3>
                            <p>Préparez votre présentation et consultez les horaires.</p>
                            <span class="work-card-link">Voir le travail →</span>
                        </div>
                    </article>

                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>

</body>
</html>