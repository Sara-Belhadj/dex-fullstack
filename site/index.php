
<?php
$pageTitle = "Accueil - Dex";
require __DIR__ . '/includes/header.php';
?>

<div class="hero-wrapper">
    <?php require __DIR__ . '/includes/navigation.php'; ?>

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
</div>

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
            <div class="course-filter">
                <label for="cours">Filtrer par cours</label>

                <select id="cours" v-model="coursSelectionne">
                    <option value="">Tous les cours</option>

                    <option
                        v-for="cours in coursDisponibles"
                        :key="cours"
                        :value="cours">
                        {{ cours }}
                    </option>
                </select>
            </div>

            <p v-if="chargement" class="loading-message">
                Chargement des travaux...
            </p>

            <p v-else-if="erreur" class="error-message">
                {{ erreur }}
            </p>

            <div class="works-grid" v-else>
                <article
                    class="work-card"
                    v-for="travail in travauxFiltres"
                    :key="travail.id">

                    <div class="work-card-content">
                        <span class="course-badge">
                            {{ travail.cours_id }}
                        </span>

                        <h3>{{ travail.titre }}</h3>
                        <p>{{ travail.description }}</p>

                        <a
                            class="work-card-link"
                            :href="'travail.php?id=' + encodeURIComponent(travail.id)">
                            Voir le travail ↗
                        </a>
                    </div>
                </article>
            </div>
        </div>
    </section>
</main>

<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="js/smooth-scroll.js"></script>
<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/app.js"></script>

<?php require __DIR__ . '/includes/footer.php'; ?>
