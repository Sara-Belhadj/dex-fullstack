
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;

// Stocker les sessions des enseignants
const sessions = new Map();

// Vérifier l'authentification d'un enseignant
function verifierAuthentification(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            erreurs: ['Connexion requise']
        });
    }

    const token = authorization.substring(7);
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({
            erreurs: ['Session invalide']
        });
    }
    if (Date.now() >= session.expiration) {
        sessions.delete(token);

        return res.status(401).json({
            erreurs: ['Session expirée']
        });
    }
    req.utilisateurId = session.utilisateurId;
    next();
}

// Tester l'authentification
app.get('/api/admin/test', verifierAuthentification, (req, res) => {
    res.json({
        message: 'Accès autorisé',
        utilisateurId: req.utilisateurId
    });
});


const bcrypt = require('bcrypt');
const crypto = require('crypto');

app.use(cors());
app.use(express.json());

app.get('/api', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.json({
            message: 'API Dex fonctionnelle',
            baseDeDonnees: 'connectée'
        });
    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur de connexion à la base de données']
        });
    }
});

// Récupérer tous les cours
app.get('/api/cours', async (req, res) => {
    try {
        const [cours] = await db.query('SELECT id, titre FROM cours ORDER BY id');
        res.json(cours);
    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la récupération des cours']
        });
    }
});

// Récupérer les travaux ouverts avec un filtre par cours
app.get('/api/travaux', async (req, res) => {
    try {
        const cours = req.query.cours;

        if (cours !== undefined && (typeof cours !== 'string' || !/^[a-zA-Z0-9-]{1,30}$/.test(cours))) {
            return res.status(400).json({
                erreurs: ['Identifiant de cours invalide']
            });
        }
        let sql = 'SELECT * FROM travaux WHERE ouvert = 1';
        const params = [];

        if (cours) {
            sql += ' AND cours_id = ?';
            params.push(cours);
        }
        sql += ' ORDER BY remise';

        const [travaux] = await db.query(sql, params);

        res.json(travaux);
    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la récupération des travaux']
        });
    }
});

// Récupérer les détails d'un travail
app.get('/api/travaux/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!/^[a-z0-9-]{1,30}$/.test(id)) {
            return res.status(400).json({
                erreurs: ['Identifiant de travail invalide']
            });
        }
        const [travaux] = await db.query(
            'SELECT * FROM travaux WHERE id = ?',
            [id]
        );

        if (travaux.length === 0) {
            return res.status(404).json({
                erreurs: ['Travail introuvable']
            });
        }

        const [creneaux] = await db.query(
            'SELECT * FROM creneaux WHERE travail_id = ? ORDER BY debut',
            [id]
        );
        res.json({
            ...travaux[0],
            creneaux: creneaux
        });

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la récupération du travail']
        });
    }
});

// Récupérer les disponibilités d'un travail
app.get('/api/travaux/:id/disponibilites', async (req, res) => {
    try {
        const id = req.params.id;
        if (!/^[a-z0-9-]{1,30}$/.test(id)) {
            return res.status(400).json({
                erreurs: ['Identifiant de travail invalide']
            });
        }
        const [travaux] = await db.query(
            'SELECT id FROM travaux WHERE id = ?',
            [id]
        );
        if (travaux.length === 0) {
            return res.status(404).json({
                erreurs: ['Travail introuvable']
            });
        }
        const [creneaux] = await db.query(
            'SELECT id, debut, fin FROM creneaux WHERE travail_id = ? ORDER BY debut',
            [id]
        );
        const [disponibilites] = await db.query(
            'SELECT creneau_id, matricule, nom FROM disponibilites WHERE travail_id = ?',
            [id]
        );
        const resultat = creneaux.map(creneau => {
            const etudiants = disponibilites
                .filter(dispo => dispo.creneau_id === creneau.id)
                .map(dispo => ({
                    matricule: dispo.matricule,
                    nom: dispo.nom
                }));
            return {
                ...creneau,
                nombre: etudiants.length,
                etudiants: etudiants
            };
        });
        res.json(resultat);

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la récupération des disponibilités']
        });
    }
});

// Enregistrer ou modifier les disponibilités d'un étudiant
app.put('/api/travaux/:id/disponibilites/:matricule', async (req, res) => {
    const { id, matricule } = req.params;
    const { nom, creneaux } = req.body || {};

    // Vérifier les informations reçues
    if (!/^[a-z0-9-]{1,30}$/.test(id) ||
        !/^[a-zA-Z0-9]{1,20}$/.test(matricule) ||
        typeof nom !== 'string' ||
        !nom.trim() ||
        nom.length > 100 ||
        !Array.isArray(creneaux) ||
        !creneaux.every(c => typeof c === 'string')) {
        return res.status(400).json({
            erreurs: ['Données invalides']
        });
    }

    // Empêcher les créneaux en double
    if (new Set(creneaux).size !== creneaux.length) {
        return res.status(400).json({
            erreurs: ['Créneaux en double']
        });
    }

    let connexion;
    try {
        connexion = await db.getConnection();
        await connexion.beginTransaction();

        // Vérifier que le travail existe et est ouvert
        const [travaux] = await connexion.query(
            'SELECT id, ouvert FROM travaux WHERE id = ? FOR UPDATE',
            [id]
        );
        if (travaux.length === 0) {
            await connexion.rollback();
            return res.status(404).json({
                erreurs: ['Travail introuvable']
            });
        }
        if (!travaux[0].ouvert) {
            await connexion.rollback();
            return res.status(409).json({
                erreurs: ['Ce travail est fermé']
            });
        }
        // Vérifier que les créneaux appartiennent au travail
        const [creneauxExistants] = await connexion.query(
            'SELECT id FROM creneaux WHERE travail_id = ?',
            [id]
        );
        const idsValides = new Set(
            creneauxExistants.map(c => c.id)
        );

        if (!creneaux.every(c => idsValides.has(c))) {
            await connexion.rollback();
            return res.status(400).json({
                erreurs: ['Un ou plusieurs créneaux sont invalides']
            });
        }
        // Supprimer les anciennes disponibilités de l'étudiant
        await connexion.query(
            'DELETE FROM disponibilites WHERE travail_id = ? AND matricule = ?',
            [id, matricule]
        );

        // Enregistrer les nouvelles disponibilités
        for (const creneauId of creneaux) {
            await connexion.query(
                `INSERT INTO disponibilites
                 (travail_id, creneau_id, matricule, nom)
                 VALUES (?, ?, ?, ?)`,
                [id, creneauId, matricule, nom.trim()]
            );
        }
        await connexion.commit();
        res.json({
            message: 'Disponibilités enregistrées',
            matricule,
            nom: nom.trim(),
            creneaux
        });

    } catch (erreur) {
        if (connexion) {
            await connexion.rollback();
        }

        console.error(erreur);
        res.status(500).json({
            erreurs: ['Erreur lors de l’enregistrement des disponibilités']
        });

    } finally {
        if (connexion) {
            connexion.release();
        }
    }
});

//Connexion d'un enseignant
app.post('/api/connexion', async (req, res) => {
    try {
        const { identifiant, motDePasse} = req.body || {};

        if (typeof identifiant !== 'string' ||
            !identifiant.trim() ||
            typeof motDePasse !== 'string' ||
            !motDePasse) {
            return res.status(400).json({
                erreurs: ['Identifiant et mot de passe requis']
            });
        }
        const [utilisateurs] = await db.query(
            'SELECT * FROM utilisateurs WHERE identifiant = ?',
            [identifiant.trim()]
        );
        if (utilisateurs.length === 0) {
            return res.status(401).json({
                erreurs: ['Identifiant ou mot de passe incorrect']
            });
        }
        const utilisateur = utilisateurs[0];
        const motDePasseValide = await bcrypt.compare(
            motDePasse,
            utilisateur.mot_de_passe_hache
        );
        if (!motDePasseValide) {
            return res.status(401).json({
                erreurs: ['Identifiant ou mot de passe incorrect']
            });
        }
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, {
            utilisateurId: utilisateur.id,
            expiration: Date.now() + 2 * 60 * 60 * 1000
        });

        res.json({
            token,
            nom: utilisateur.nom
        });

    } catch (erreur) {
        console.error(erreur);
        res.status(500).json({
            erreurs: ['Erreur lors de la connexion']
        });
    }
});

// Déconnexion d'un enseignant
app.post('/api/deconnexion', (req, res) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            erreurs: ['Connexion requise']
        });
    }
    const token = authorization.substring(7);
    if (!sessions.has(token)) {
        return res.status(401).json({
            erreurs: ['Session invalide']
        });
    }
    sessions.delete(token);
    res.status(204).send();
});

// Récupérer les travaux de l'enseignant connecté
app.get('/api/admin/travaux', verifierAuthentification, async (req, res) => {
    try {
        const utilisateurId = req.utilisateurId;

        const [travaux] = await db.query(
            `SELECT travaux.*
             FROM travaux
             INNER JOIN cours ON travaux.cours_id = cours.id
             WHERE cours.utilisateur_id = ?
             ORDER BY travaux.remise`,
            [utilisateurId]
        );
        res.json(travaux);

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la récupération des travaux']
        });
    }
});

// Modifier un travail
app.put('/api/travaux/:id', verifierAuthentification, async (req, res) => {
    try {
        const id = req.params.id;
        const utilisateurId = req.utilisateurId;

        const { titre, description, type, disponible, remise, ouvert } = req.body || {};

        if (!/^[a-z0-9-]{1,30}$/.test(id) ||
            typeof titre !== 'string' || !titre.trim() || titre.length > 150 ||
            typeof description !== 'string' ||
            typeof type !== 'string' || !type.trim() || type.length > 20 ||
            typeof disponible !== 'string' ||
            typeof remise !== 'string' ||
            typeof ouvert !== 'boolean') {
            return res.status(400).json({
                erreurs: ['Données invalides']
            });
        }

        const dateDisponible = new Date(disponible);
        const dateRemise = new Date(remise);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(disponible) ||
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(remise) ||
            Number.isNaN(dateDisponible.getTime()) ||
            Number.isNaN(dateRemise.getTime()) ||
            dateRemise <= dateDisponible) {
            return res.status(400).json({
                erreurs: ['Dates invalides']
            });
        }

        // Vérifier que le travail existe et appartient à l'enseignant
        const [travaux] = await db.query(
            `SELECT travaux.id, cours.utilisateur_id
             FROM travaux
             INNER JOIN cours ON travaux.cours_id = cours.id
             WHERE travaux.id = ?`,
            [id]
        );

        if (travaux.length === 0) {
            return res.status(404).json({
                erreurs: ['Travail introuvable']
            });
        }

        if (travaux[0].utilisateur_id !== utilisateurId) {
            return res.status(403).json({
                erreurs: ['Accès interdit']
            });
        }

        await db.query(
            `UPDATE travaux
             SET titre = ?, description = ?, type = ?,
                 disponible = ?, remise = ?, ouvert = ?
             WHERE id = ?`,
            [
                titre.trim(),
                description,
                type.trim(),
                disponible,
                remise,
                ouvert,
                id
            ]
        );

        res.json({
            message: 'Travail modifié avec succès'
        });

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la modification du travail']
        });
    }
});

// Ajouter un créneau à un travail
app.post('/api/travaux/:id/creneaux', verifierAuthentification, async (req, res) => {
    try {
        const id = req.params.id;
        const utilisateurId = req.utilisateurId;
        const { debut, fin } = req.body || {};

        if (!/^[a-z0-9-]{1,30}$/.test(id) ||
            typeof debut !== 'string' ||
            typeof fin !== 'string' ||
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(debut) ||
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fin)) {
            return res.status(400).json({
                erreurs: ['Données invalides']
            });
        }

        // Vérifier que la date de fin est après le début
        const debutDate = new Date(debut.replace(' ', 'T'));
        const finDate = new Date(fin.replace(' ', 'T'));

        if (Number.isNaN(debutDate.getTime()) ||
            Number.isNaN(finDate.getTime()) ||
            finDate <= debutDate) {
            return res.status(400).json({
                erreurs: ['Dates invalides']
            });
        }

        // Vérifier que le travail existe et appartient à l'enseignant
        const [travaux] = await db.query(
            `SELECT travaux.id, cours.utilisateur_id
             FROM travaux
             INNER JOIN cours ON travaux.cours_id = cours.id
             WHERE travaux.id = ?`,
            [id]
        );

        if (travaux.length === 0) {
            return res.status(404).json({
                erreurs: ['Travail introuvable']
            });
        }

        if (travaux[0].utilisateur_id !== utilisateurId) {
            return res.status(403).json({
                erreurs: ['Accès interdit']
            });
        }

        // Trouver le prochain numéro de créneau disponible
        const [creneaux] = await db.query(
            'SELECT id FROM creneaux WHERE travail_id = ?',
            [id]
        );

        const numeros = creneaux
            .map(c => {
                const correspondance = c.id.match(/-(\d+)$/);
                return correspondance ? Number(correspondance[1]) : 0;
            });

        const prochainNumero = Math.max(0, ...numeros) + 1;
        const creneauId = `${id}-${String(prochainNumero).padStart(2, '0')}`;

        await db.query(
            'INSERT INTO creneaux (id, travail_id, debut, fin) VALUES (?, ?, ?, ?)',
            [creneauId, id, debut, fin]
        );

        res.status(201).json({
            id: creneauId,
            travail_id: id,
            debut,
            fin
        });

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la création du créneau']
        });
    }
});

// Modifier un créneau
app.put('/api/creneaux/:id', verifierAuthentification, async (req, res) => {
    try {
        const id = req.params.id;
        const utilisateurId = req.utilisateurId;
        const { debut, fin } = req.body || {};

        // Vérifier les informations reçues
        if (!/^[a-z0-9-]{1,30}$/.test(id) ||
            typeof debut !== 'string' ||
            typeof fin !== 'string' ||
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(debut) ||
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fin)) {
            return res.status(400).json({
                erreurs: ['Données invalides']
            });
        }

        const dateDebut = new Date(debut.replace(' ', 'T'));
        const dateFin = new Date(fin.replace(' ', 'T'));

        if (Number.isNaN(dateDebut.getTime()) ||
            Number.isNaN(dateFin.getTime()) ||
            dateFin <= dateDebut) {
            return res.status(400).json({
                erreurs: ['Dates invalides']
            });
        }

        // Vérifier que le créneau existe et appartient à l'enseignant
        const [creneaux] = await db.query(
            `SELECT creneaux.id, cours.utilisateur_id
             FROM creneaux
             INNER JOIN travaux ON creneaux.travail_id = travaux.id
             INNER JOIN cours ON travaux.cours_id = cours.id
             WHERE creneaux.id = ?`,
            [id]
        );

        if (creneaux.length === 0) {
            return res.status(404).json({
                erreurs: ['Créneau introuvable']
            });
        }

        if (creneaux[0].utilisateur_id !== utilisateurId) {
            return res.status(403).json({
                erreurs: ['Accès interdit']
            });
        }

        // Modifier le créneau
        await db.query(
            'UPDATE creneaux SET debut = ?, fin = ? WHERE id = ?',
            [debut, fin, id]
        );

        res.json({
            message: 'Créneau modifié avec succès'
        });

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la modification du créneau']
        });
    }
});

// Supprimer un créneau
app.delete('/api/creneaux/:id', verifierAuthentification, async (req, res) => {
    const id = req.params.id;
    const utilisateurId = req.utilisateurId;
    const { confirmer } = req.body || {};

    if (!/^[a-z0-9-]{1,30}$/.test(id)) {
        return res.status(400).json({
            erreurs: ['Identifiant de créneau invalide']
        });
    }

    let connexion;

    try {
        connexion = await db.getConnection();
        await connexion.beginTransaction();

        // Vérifier que le créneau existe et appartient à l'enseignant
        const [creneaux] = await connexion.query(
            `SELECT creneaux.id, cours.utilisateur_id
             FROM creneaux
             INNER JOIN travaux ON creneaux.travail_id = travaux.id
             INNER JOIN cours ON travaux.cours_id = cours.id
             WHERE creneaux.id = ?
             FOR UPDATE`,
            [id]
        );

        if (creneaux.length === 0) {
            await connexion.rollback();

            return res.status(404).json({
                erreurs: ['Créneau introuvable']
            });
        }

        if (creneaux[0].utilisateur_id !== utilisateurId) {
            await connexion.rollback();

            return res.status(403).json({
                erreurs: ['Accès interdit']
            });
        }

        // Compter les disponibilités associées au créneau
        const [resultat] = await connexion.query(
            'SELECT COUNT(*) AS nombre FROM disponibilites WHERE creneau_id = ?',
            [id]
        );

        const nombre = resultat[0].nombre;

        // Demander une confirmation si des étudiants sont inscrits
        if (nombre > 0 && confirmer !== true) {
            await connexion.rollback();

            return res.status(409).json({
                erreurs: ['Confirmation requise pour supprimer ce créneau'],
                nombre
            });
        }

        // Supprimer le créneau
        await connexion.query(
            'DELETE FROM creneaux WHERE id = ?',
            [id]
        );

        await connexion.commit();

        res.status(204).send();

    } catch (erreur) {
        if (connexion) {
            await connexion.rollback();
        }

        console.error(erreur);

        res.status(500).json({
            erreurs: ['Erreur lors de la suppression du créneau']
        });

    } finally {
        if (connexion) {
            connexion.release();
        }
    }
});


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}/api`);
});

