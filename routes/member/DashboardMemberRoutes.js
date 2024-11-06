import express from 'express';
import connexion from '../../database/connexion.js'; // Ensure your database connection is properly configured

const router = express.Router();

router.get('/members/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM users WHERE id = ?';
  connexion.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(results[0]);
  });
});
// Route to update a member's profile
router.put('/members/:id', (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email } = req.body; // Extract fields to update

  // Construct the query to update the member's profile
  const query = 'UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id = ?';

  // Execute the query with the provided parameters
  connexion.query(query, [nom, prenom, email, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('User not found');
    }
    res.send('Profile updated successfully');
  });
});

// Route to fetch projects for a specific member
router.get('/:memberId/projects', async (req, res) => {
  const memberId = req.params.memberId;
  console.log("id member:", memberId);
  try {
    const query = `
      SELECT p.*
      FROM projects p
      JOIN project_groups pg ON p.id = pg.project_id
      JOIN user_groups ug ON pg.group_id = ug.group_id
      WHERE ug.user_id = ?`;

    console.log("Projects Query:", query);

    // Execute the query with the memberId as the parameter
    connexion.query(query, [memberId], (error, results) => {
      if (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Log the results to verify the output
      console.log("Projects:", results);

      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to fetch tasks for a specific member
router.get('/:memberId/tasks', async (req, res) => {
  const memberId = req.params.memberId;
  try {
    const query = `
      SELECT t.*
      FROM tasks t
      WHERE t.assigned_to = ?`;

    console.log("Projects Query:", query);

    // Execute the query with the memberId as the parameter
    connexion.query(query, [memberId], (error, tasks) => {
      if (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Log the tasks to verify the output
      console.log("Projects:", tasks);

      res.json(tasks);
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/tasks/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  // Valider le statut
  const allowedStatuses = ['en cours', 'terminé', 'pas encore commencé'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  try {
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    connexion.query(query, [status, taskId], (error, result) => {
      if (error) {
        console.error('Erreur lors de la mise à jour du statut de la tâche:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Tâche non trouvée' });
      }
      res.json({ message: 'Statut de la tâche mis à jour avec succès' });
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
