const { createApp } = Vue;

createApp({
    data() {
        return {
            travail: {},
            chargement: true,
            erreur: ""
        };
    },

    async mounted() {
        const id = document.getElementById("app").dataset.travailId;

        try {
            this.travail = await getTravail(id);
        } catch (error) {
            this.erreur = "Impossible de charger ce travail.";
            console.error(error);
        } finally {
            this.chargement = false;
        }
    }
}).mount("#app");