
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;

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


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}/api`);
});

