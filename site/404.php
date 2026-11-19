
<?php
http_response_code(404);

$pageTitle = "Page introuvable - Dex";
require __DIR__ . '/includes/header.php';
?>

<?php require __DIR__ . '/includes/navigation.php'; ?>

<main>
    <h1>404</h1>
    <h2>Page introuvable</h2>

    <p>La page demandée n'existe pas.</p>

    <a href="index.php">Retour à l'accueil</a>
</main>

<?php require __DIR__ . '/includes/footer.php'; ?>
