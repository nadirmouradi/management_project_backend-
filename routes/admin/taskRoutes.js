import express from 'express';
import connexion from "../../database/connexion.js";

const router = express.Router();

// Récupérer toutes les tâches
router.get('/', (req, res) => {
  connexion.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Récupérer une tâche par ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connexion.query('SELECT * FROM tasks WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else if (results.length === 0) {
      res.status(404).json({ error: `Tâche avec l'ID ${id} non trouvée` });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// Créer une nouvelle tâche
router.post('/', (req, res) => {
  const { project_id, name, description, assigned_to, status, due_date } = req.body;
  connexion.query('INSERT INTO tasks (project_id, name, description, assigned_to, status, due_date) VALUES (?, ?, ?, ?, ?, ?)', [project_id, name, description, assigned_to, status, due_date], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(201).json({ message: 'Tâche créée avec succès', id: result.insertId });
    }
  });
});

// Mettre à jour une tâche par ID
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { project_id, name, description, assigned_to, status, due_date } = req.body;
  connexion.query('UPDATE tasks SET project_id = ?, name = ?, description = ?, assigned_to = ?, status = ?, due_date = ? WHERE id = ?', [project_id, name, description, assigned_to, status, due_date, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ message: `Tâche avec l'ID ${id} mise à jour avec succès` });
    }
  });
});

// Supprimer une tâche par ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  connexion.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.status(200).json({ message: `Tâche avec l'ID ${id} supprimée avec succès` });
    }
  });
});

export default router;
