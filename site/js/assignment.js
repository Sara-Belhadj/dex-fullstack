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
            creneauxSelectionnes: [],
            enregistrement: false,
            messageSucces: "",
            messageErreur: ""
        };
    },

    methods: {
        async enregistrer() {
            this.messageSucces = "";
            this.messageErreur = "";

            if (!/^[a-zA-Z0-9]{1,20}$/.test(this.matricule.trim())) {
                this.messageErreur = "Veuillez entrer un matricule valide.";
                return;
            }

            if (!this.nom.trim() || this.nom.length > 100) {
                this.messageErreur = "Veuillez entrer un nom valide.";
                return;
            }

            this.enregistrement = true;

            try {
                const id = document.getElementById("app").dataset.travailId;

                await enregistrerDisponibilites(
                    id,
                    this.matricule.trim(),
                    this.nom.trim(),
                    this.creneauxSelectionnes
                );

                this.creneaux = await getDisponibilites(id);
                this.messageSucces = "Vos disponibilités ont été enregistrées avec succès.";

            } catch (error) {
                this.messageErreur = error.message;
                console.error(error);
            } finally {
                this.enregistrement = false;
            }
        },  

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