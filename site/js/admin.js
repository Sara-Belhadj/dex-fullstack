const { createApp } = Vue;

createApp({
    data() {
        return {
            identifiant: "",
            motDePasse: "",
            chargement: false,
            erreur: ""
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
                    throw new Error(resultat.erreurs?.[0] || "Connexion impossible.");
                }

                sessionStorage.setItem("dexToken", resultat.token);
                sessionStorage.setItem("dexNom", resultat.nom);

                this.motDePasse = "";

            } catch (error) {
                this.erreur = error.message;
            } finally {
                this.chargement = false;
            }
        }
    }
}).mount("#app");