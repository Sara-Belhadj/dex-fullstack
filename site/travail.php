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

                <div class="slots-section">
                    <h3>Créneaux proposés</h3>
                    <p v-if="creneaux.length === 0">Aucun créneau disponible pour ce travail.</p>

                    <div v-else class="slots-grid">
                        <article class="slot-card" v-for="creneau in creneaux" :key="creneau.id">
                            <span class="slot-date">{{ formaterDate(creneau.debut) }}</span>
                            <h4>{{ formaterHeure(creneau.debut) }} – {{ formaterHeure(creneau.fin) }}</h4>
                            <p>{{ creneau.nombre }} étudiant(s) inscrit(s)</p>

                        </article>
                    </div>
                </div>

                <div class="availability-form">
                    <h3>Mes disponibilités</h3>
                    <p>Identifiez-vous pour indiquer vos disponibilités.</p>

                    <div class="form-group">
                        <label for="matricule">Matricule</label>
                        <input id="matricule" type="text" v-model="matricule" placeholder="Votre matricule" maxlength="20"  autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label for="nom">Nom complet</label>
                        <input id="nom" type="text" v-model="nom" placeholder="Votre nom complet" maxlength="100" autocomplete="name">
                    </div>

                    <div class="availability-selection">
                        <h4>Sélectionnez vos disponibilités</h4>
                        <label v-for="creneau in creneaux" :key="creneau.id" class="availability-option">
                        <input type="checkbox" :value="creneau.id" v-model="creneauxSelectionnes">
                            <span>{{ formaterDate(creneau.debut) }} — {{ formaterHeure(creneau.debut) }} à {{ formaterHeure(creneau.fin) }}</span>
                        </label>
                    </div>
                    <button type="button" class="availability-submit" @click="enregistrer" :disabled="enregistrement">{{ enregistrement ? "Enregistrement..." : "Enregistrer mes disponibilités" }}</button>
                    <p v-if="messageSucces" class="form-success">{{ messageSucces }}</p>
                    <p v-if="messageErreur" class="form-error">{{ messageErreur }}</p>
                </div>
            </section>

        </div>
    </main>

    <footer>
        <p>Dex - Gestion des disponibilités</p>
    </footer>
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="js/config.js"></script>
    <script src="js/api.js?v=2"></script>
    <script src="js/assignment.js"></script>
</body>
</html>