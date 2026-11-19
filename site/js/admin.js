
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
            erreurTravaux: "",
            travailSelectionne: null,
            formulaireTravail: {
                titre: "",
                description: "",
                type: "",
                disponible: "",
                remise: "",
                ouvert: false
            },
            modificationEnCours: false,
            erreurModification: "",
            succesModification: ""
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
        },

        async deconnexion() {
            const token = sessionStorage.getItem("dexToken");
            try {
                const response = await fetch(`${API_BASE_URL}/deconnexion`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok && response.status !== 401) {
                    throw new Error("Déconnexion impossible.");
                }
            } catch (error) {
                console.error("Erreur de déconnexion :", error);
            } finally {
                sessionStorage.removeItem("dexToken");
                sessionStorage.removeItem("dexNom");

                this.connecte = false;
                this.nomEnseignant = "";
                this.identifiant = "";
                this.motDePasse = "";
                this.travaux = [];
                this.erreur = "";
                this.erreurTravaux = "";
            }
        },

        selectionnerTravail(travail) {
            this.travailSelectionne = travail.id;
            this.formulaireTravail = {
                titre: travail.titre,
                description: travail.description || "",
                type: travail.type,
                disponible: travail.disponible ? travail.disponible.slice(0, 10) : "",
                remise: travail.remise ? travail.remise.slice(0, 10) + "T" + travail.remise.slice(11, 16) : "",
                ouvert: Boolean(travail.ouvert)
            };

            this.erreurModification = "";
            this.succesModification = "";
        },

        async modifierTravail() {
            if (!this.travailSelectionne) return;

            this.modificationEnCours = true;
            this.erreurModification = "";
            this.succesModification = "";

            try {
                const token = sessionStorage.getItem("dexToken");
                const formulaire = this.formulaireTravail;
                const donnees = {
                    titre: formulaire.titre.trim(),
                    description: formulaire.description.trim(),
                    type: formulaire.type.trim(),
                    disponible: formulaire.disponible,
                    remise: formulaire.remise.replace("T", " ") + ":00",
                    ouvert: formulaire.ouvert
                };

                const response = await fetch(
                    `${API_BASE_URL}/travaux/${encodeURIComponent(this.travailSelectionne)}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(donnees)
                    }
                );
                const resultat = await response.json();

                if (!response.ok) {
                    throw new Error(resultat.erreurs?.[0] || resultat.message || "Impossible de modifier le travail.");
                }
                await this.chargerTravaux();
                this.succesModification = "Travail modifié avec succès.";

            } catch (error) {
                this.erreurModification = error.message;
            } finally {
                this.modificationEnCours = false;
            }
        }

    },

    mounted() {
        if (this.connecte) {
            this.chargerTravaux();
        }
    }
}).mount("#app");
