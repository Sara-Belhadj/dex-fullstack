<?php
$id = $_GET['id'] ?? '';

if (!is_string($id) || !preg_match('/^[a-z0-9-]{1,30}$/', $id)) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    exit;
}

$pageTitle = "Détails du travail - Dex";
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?></title>
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
        <a href="index.php">← Retour aux travaux</a>

        <h2>Détails du travail</h2>

        <div id="app"
             data-travail-id="<?= htmlspecialchars($id, ENT_QUOTES, 'UTF-8') ?>">
            <!-- Vue.js affichera les informations du travail ici -->
        </div>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>

</body>
</html>