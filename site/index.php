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
                <h2>Travaux disponibles</h2>
                <p>Consultez les travaux de vos cours.</p>
            </div>

            <div id="app"></div>
        </section>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>

</body>
</html>