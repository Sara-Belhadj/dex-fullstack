
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
            succesModification: "",
            nouveauCreneau: {
                debut: "",
                fin: ""
            },
            ajoutCreneauEnCours: false,
            erreurCreneau: "",
            succesCreneau: "",
            creneaux: [],
            chargementCreneaux: false,
            erreurListeCreneaux: "",
            creneauSelectionne: null,
            formulaireCreneau: {
                debut: "",
                fin: ""
            },
            modificationCreneauEnCours: false,
            erreurModificationCreneau: "",
            succesModificationCreneau: "",
            suppressionCreneauEnCours: false,
            erreurSuppressionCreneau: ""
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
            this.creneaux = [];
            this.chargerCreneaux();
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
        },

        async ajouterCreneau() {
            this.erreurCreneau = "";
            this.succesCreneau = "";

            const { debut, fin } = this.nouveauCreneau;

            if (new Date(fin) <= new Date(debut)) {
                this.erreurCreneau = "La fin doit être après le début.";
                return;
            }
            this.ajoutCreneauEnCours = true;
            try {
                const token = sessionStorage.getItem("dexToken");
                const response = await fetch(
                    `${API_BASE_URL}/travaux/${encodeURIComponent(this.travailSelectionne)}/creneaux`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            debut: debut.replace("T", " ") + ":00",
                            fin: fin.replace("T", " ") + ":00"
                        })
                    }
                );
                const resultat = await response.json();

                if (!response.ok) {
                    throw new Error(
                        resultat.erreurs?.[0] ||
                        resultat.message ||
                        "Impossible d'ajouter le créneau."
                    );
                }

                this.nouveauCreneau = { debut: "", fin: "" };
                await this.chargerCreneaux();

                if (this.erreurListeCreneaux) {
                    throw new Error("Créneau créé, mais impossible d'actualiser la liste.");
                }

                this.succesCreneau = "Créneau ajouté avec succès.";

            } catch (error) {
                this.erreurCreneau = error.message;
            } finally {
                this.ajoutCreneauEnCours = false;
            }
        },

        async chargerCreneaux() {
            this.chargementCreneaux = true;
            this.erreurListeCreneaux = "";

            try {
                const response = await fetch(`${API_BASE_URL}/travaux/${encodeURIComponent(this.travailSelectionne)}/disponibilites`);
                const resultat = await response.json();

                if (!response.ok) {
                    throw new Error("Impossible de charger les créneaux.");
                }
                this.creneaux = resultat;
            } catch (error) {
                this.erreurListeCreneaux = error.message;
            } finally {
                this.chargementCreneaux = false;
            }
        },

        formaterDate(date) {
            return new Intl.DateTimeFormat("fr-CA", {
                timeZone: "America/Toronto",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date(date));
        },

        selectionnerCreneau(creneau) {
            this.creneauSelectionne = creneau.id;
            const versDateLocale = (date) => {
                const parties = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "America/Toronto",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23"
                }).formatToParts(new Date(date));

                const valeur = (type) =>
                    parties.find(partie => partie.type === type).value;
                return `${valeur("year")}-${valeur("month")}-${valeur("day")}T${valeur("hour")}:${valeur("minute")}`;
            };

            this.formulaireCreneau = {
                debut: versDateLocale(creneau.debut),
                fin: versDateLocale(creneau.fin)
            };

            this.erreurModificationCreneau = "";
            this.succesModificationCreneau = "";
        },

        async modifierCreneau() {
            this.erreurModificationCreneau = "";
            this.succesModificationCreneau = "";

            const { debut, fin } = this.formulaireCreneau;

            if (!debut || !fin || new Date(fin) <= new Date(debut)) {
                this.erreurModificationCreneau = "La date de fin doit être après la date de début.";
                return;
            }

            this.modificationCreneauEnCours = true;

            try {
                const token = sessionStorage.getItem("dexToken");

                const response = await fetch(
                    `${API_BASE_URL}/creneaux/${encodeURIComponent(this.creneauSelectionne)}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            debut: debut.replace("T", " ") + ":00",
                            fin: fin.replace("T", " ") + ":00"
                        })
                    }
                );
                const resultat = await response.json();
                if (!response.ok) {
                    throw new Error(
                        resultat.erreurs?.[0] ||
                        resultat.message ||
                        "Impossible de modifier le créneau."
                    );
                }

                await this.chargerCreneaux();

                if (this.erreurListeCreneaux) {
                    throw new Error("Créneau modifié, mais impossible d'actualiser la liste.");
                }
                this.succesModificationCreneau = "Créneau modifié avec succès.";

            } catch (error) {
                this.erreurModificationCreneau = error.message;
            } finally {
                this.modificationCreneauEnCours = false;
            }
        },
        
        async supprimerCreneau(creneau) {
            const confirmation = window.confirm(
                `Voulez-vous vraiment supprimer ce créneau ?\n\n` +
                `Début : ${this.formaterDate(creneau.debut)}\n` +
                `Fin : ${this.formaterDate(creneau.fin)}\n` +
                `Étudiants inscrits : ${creneau.nombre}`
            );

            if (!confirmation) return;

            this.suppressionCreneauEnCours = true;
            this.erreurSuppressionCreneau = "";

            try {
                const token = sessionStorage.getItem("dexToken");

                const envoyerSuppression = async (confirmer = false) => {
                    return fetch(
                        `${API_BASE_URL}/creneaux/${encodeURIComponent(creneau.id)}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ confirmer })
                        }
                    );
                };

                let response = await envoyerSuppression();

                if (response.status === 409) {
                    const confirmationInscrits = window.confirm(
                        `Attention : ce créneau contient ${creneau.nombre} étudiant(s) inscrit(s).\n\n` +
                        "Confirmez-vous sa suppression malgré les inscriptions ?"
                    );

                    if (!confirmationInscrits) return;

                    response = await envoyerSuppression(true);
                }

                if (!response.ok) {
                    const resultat = await response.json().catch(() => ({}));

                    throw new Error(
                        resultat.erreurs?.[0] ||
                        resultat.message ||
                        "Impossible de supprimer le créneau."
                    );
                }

                if (this.creneauSelectionne === creneau.id) {
                    this.creneauSelectionne = null;
                }

                await this.chargerCreneaux();

            } catch (error) {
                this.erreurSuppressionCreneau = error.message;
            } finally {
                this.suppressionCreneauEnCours = false;
            }
        }

    },

    mounted() {
        if (this.connecte) {
            this.chargerTravaux();
        }
    }
}).mount("#app");
