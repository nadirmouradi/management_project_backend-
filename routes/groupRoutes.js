import express from 'express';
import connexion from '../database/connexion.js';

const router = express.Router();

// Récupérer tous les groupes
router.get('/api/groups', (req, res) => {
  connexion.query('SELECT * FROM groups', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Récupérer un groupe par ID
router.get('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  connexion.query('SELECT * FROM groups WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else if (results.length === 0) {
      res.status(404).json({ error: `Groupe avec l'ID ${id} non trouvé` });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// Créer un nouveau groupe
router.post('/api/groups', (req, res) => {
  const { name, description } = req.body;
  connexion.query('INSERT INTO groups (name, description) VALUES (?, ?)', [name, description], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(201).json({ message: 'Groupe créé avec succès', id: result.insertId });
    }
  });
});

// Mettre à jour un groupe par ID
router.put('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  connexion.query('UPDATE groups SET name = ?, description = ? WHERE id = ?', [name, description, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ message: `Groupe avec l'ID ${id} mis à jour avec succès` });
    }
  });
});

// Supprimer un groupe par ID
router.delete('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  connexion.query('DELETE FROM groups WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ message: `Groupe avec l'ID ${id} supprimé avec succès` });
    }
  });
});

export default router;
