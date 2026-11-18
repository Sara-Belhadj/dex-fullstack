const { createApp } = Vue;

createApp({
    data() {
        return {
            travaux: []
        };
    },

    async mounted() {
        try {
            this.travaux = await getTravaux();
            console.log("Travaux chargés :", this.travaux);
        } catch (error) {
            console.error("Erreur de chargement :", error);
        }
    }
}).mount("#app");