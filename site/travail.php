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
        <a href="index.php">← Retour aux travaux</a>

        <h2>Détails du travail</h2>

        <div id="app"
            data-travail-id="<?= htmlspecialchars($id, ENT_QUOTES, 'UTF-8') ?>">

            <p v-if="chargement">Chargement du travail...</p>
            <p v-else-if="erreur" class="error-message">{{ erreur }}</p>

            <section v-else class="assignment-details">
                <span class="course-badge">{{ travail.cours_id }}</span>

                <h2>{{ travail.titre }}</h2>
                <p>{{ travail.description }}</p>
                <span class="assignment-type">Type : {{ travail.type }}</span>
            </section>

        </div>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="js/config.js"></script>
    <script src="js/api.js"></script>
    <script src="js/assignment.js"></script>
</body>
</html>