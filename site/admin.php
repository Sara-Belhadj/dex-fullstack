<?php
$pageTitle = "Administration - Dex";
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
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
            <!-- Vue.js affichera le formulaire de connexion ici -->
        </div>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>

</body>
</html>