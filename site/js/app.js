const { createApp } = Vue;

createApp({
    data() {
        return {
            travaux: [],
            coursSelectionne: "",
            chargement: true,
            erreur: ""
        };
    },

    computed: {
        coursDisponibles() {
            return [...new Set(this.travaux.map(travail => travail.cours_id))];
        },

        travauxFiltres() {
            if (!this.coursSelectionne) {
                return this.travaux;
            }

            return this.travaux.filter(
                travail => travail.cours_id === this.coursSelectionne
            );
        }
    },

    async mounted() {
        try {
            this.travaux = await getTravaux();
        } catch (error) {
            this.erreur = "Impossible de charger les travaux.";
            console.error(error);
        } finally {
            this.chargement = false;
        }
    }
}).mount("#app");