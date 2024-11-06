import express from 'express';
import connexion from "../../database/connexion.js";

const router = express.Router();

// Récupérer tous les membres avec leurs groupes
router.get('/', (req, res) => {
  const query = `
    SELECT 
      u.id, u.nom, u.prenom, u.email, 
      g.name AS groupName
    FROM 
      users u
    LEFT JOIN 
      user_groups ug ON u.id = ug.user_id
    LEFT JOIN 
      group_s g ON ug.group_id = g.id;
  `;

  connexion.query(query, (err, results) => {
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

// Récupérer les groupes d'un membre spécifique
router.get('/:id/groups', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      g.id, g.name, g.description
    FROM 
      user_groups ug
    JOIN 
      groups g ON ug.group_id = g.id
    WHERE 
      ug.user_id = ?;
  `;
  
  connexion.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json(results);
    }
  });
});

export default router;
