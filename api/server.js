
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

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}/api`);
});
