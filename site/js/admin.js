
const { createApp } = Vue;

createApp({
    data() {
        return {
            identifiant: "",
            motDePasse: "",
            chargement: false,
            erreur: "",
            connecte: !!sessionStorage.getItem("dexToken"),
            nomEnseignant: sessionStorage.getItem("dexNom") || "",
            travaux: [],
            chargementTravaux: false,
            erreurTravaux: ""
        };
    },

    methods: {
        async connexion() {
            this.erreur = "";
            this.chargement = true;

            try {
                const response = await fetch(`${API_BASE_URL}/connexion`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        identifiant: this.identifiant.trim(),
                        motDePasse: this.motDePasse
                    })
                });

                const resultat = await response.json();

                if (!response.ok) {
                    throw new Error(
                        resultat.erreurs?.[0] || "Connexion impossible."
                    );
                }

                sessionStorage.setItem("dexToken", resultat.token);
                sessionStorage.setItem("dexNom", resultat.nom);

                this.connecte = true;
                this.nomEnseignant = resultat.nom;
                this.motDePasse = "";

                await this.chargerTravaux();

            } catch (error) {
                this.erreur = error.message;
            } finally {
                this.chargement = false;
            }
        },

        async chargerTravaux() {
            this.chargementTravaux = true;
            this.erreurTravaux = "";

            try {
                const token = sessionStorage.getItem("dexToken");

                const response = await fetch(`${API_BASE_URL}/admin/travaux`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const resultat = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        sessionStorage.removeItem("dexToken");
                        sessionStorage.removeItem("dexNom");
                        this.connecte = false;
                        this.nomEnseignant = "";
                    }

                    throw new Error(resultat.erreurs?.[0] || "Impossible de récupérer les travaux.");
                }

                this.travaux = resultat;

            } catch (error) {
                this.erreurTravaux = error.message;
            } finally {
                this.chargementTravaux = false;
            }
        }
    },

    mounted() {
        if (this.connecte) {
            this.chargerTravaux();
        }
    }
}).mount("#app");
