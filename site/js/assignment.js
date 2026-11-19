const { createApp } = Vue;

createApp({
    data() {
        return {
            travail: {},
            creneaux: [],
            chargement: true,
            erreur: "",

            matricule: "",
            nom: "",
            creneauxSelectionnes: []
        };
    },

    methods: {
        formaterDate(date) {
            return new Intl.DateTimeFormat("fr-CA", {
                timeZone: "America/Toronto",
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(new Date(date));
        },

        formaterHeure(date) {
            return new Intl.DateTimeFormat("fr-CA", {
                timeZone: "America/Toronto",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(new Date(date));
        }
    },

    async mounted() {
        const id = document.getElementById("app").dataset.travailId;

        try {
            const [travail, creneaux] = await Promise.all([
                getTravail(id),
                getDisponibilites(id)
            ]);

            this.travail = travail;
            this.creneaux = creneaux;
        } catch (error) {
            this.erreur = "Impossible de charger ce travail.";
            console.error(error);
        } finally {
            this.chargement = false;
        }
    }
}).mount("#app");