
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

            if (!this.nom.trim() || this.nom.trim().length > 100) {
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

                    console.log("Après enregistrement :", {
                        matricule: this.matricule,
                        nom: this.nom,
                        creneauxSelectionnes: this.creneauxSelectionnes,
                        creneaux: this.creneaux
                    });

                    this.messageSucces = "Vos disponibilités ont été enregistrées avec succès.";

                // Save student information after successful registration
                localStorage.setItem("dex_matricule", this.matricule.trim());
                localStorage.setItem("dex_nom", this.nom.trim());

                // Remember selected slots for this assignment
                localStorage.setItem(
                    `dex_creneaux_${id}_${this.matricule.trim()}`,
                    JSON.stringify(this.creneauxSelectionnes)
                );

                this.messageSucces = "Vos disponibilités ont été enregistrées avec succès.";

            } catch (error) {
                this.messageErreur = error.message;
                console.error(error);
            } finally {
                this.enregistrement = false;
            }
        },

        restaurerDisponibilites(id) {
            const matricule = localStorage.getItem("dex_matricule");
            const nom = localStorage.getItem("dex_nom");

            if (!matricule || !nom) {
                return;
            }

            this.matricule = matricule;
            this.nom = nom;

            const sauvegarde = localStorage.getItem(
                `dex_creneaux_${id}_${matricule}`
            );

            if (sauvegarde) {
                try {
                    const selection = JSON.parse(sauvegarde);

                    if (Array.isArray(selection)) {
                        this.creneauxSelectionnes = selection;
                    }
                } catch (error) {
                    console.error("Impossible de restaurer les créneaux.", error);
                }
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

            // Restore saved student information and selections
            this.restaurerDisponibilites(id);

        } catch (error) {
            this.erreur = "Impossible de charger ce travail.";
            console.error(error);
        } finally {
            this.chargement = false;
        }
    }
}).mount("#app");
