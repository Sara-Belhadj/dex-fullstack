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
        <h2>Travaux disponibles</h2>
        <p>Consultez les travaux et indiquez vos disponibilités.</p>

        <div id="app">
            <!-- Vue.js affichera les travaux ici -->
        </div>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>

</body>
</html>