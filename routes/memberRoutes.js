// Dans votre fichier de routes, par exemple memberRoutes.js
import express from 'express';
import connexion from '../database/connexion.js';

const router = express.Router();

// Récupérer tous les membres
router.get('/', (req, res) => {
  connexion.query('SELECT id, nom, prenom, email FROM users', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Supprimer un membre par ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connexion.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ message: `Membre avec l'ID ${id} supprimé avec succès` });
    }
  });
});

// Récupérer les tâches assignées à un membre par ID
router.get('/:id/tasks', (req, res) => {
  const { id } = req.params;
  connexion.query('SELECT * FROM tasks WHERE assigned_to = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json(results);
    }
  });
});

export default router;
