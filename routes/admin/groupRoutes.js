import express from "express";
import connexion from "../../database/connexion.js";

const router = express.Router();

// Récupérer tous les groupes
router.get("/", (req, res) => {
  connexion.query("SELECT * FROM group_s", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Récupérer un groupe par ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  connexion.query("SELECT * FROM group_s WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    } else if (results.length === 0) {
      res.status(404).json({ error: `Groupe avec l'ID ${id} non trouvé` });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// Créer un nouveau groupe
router.post("/", (req, res) => {
  const { name, description } = req.body;
  connexion.query(
    "INSERT INTO group_s (name, description) VALUES (?, ?)",
    [name, description],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne du serveur" });
      } else {
        res
          .status(201)
          .json({ message: "Groupe créé avec succès", id: result.insertId });
      }
    }
  );
});

// Mettre à jour un groupe par ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  connexion.query(
    "UPDATE group_s SET name = ?, description = ? WHERE id = ?",
    [name, description, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne du serveur" });
      } else {
        res
          .status(200)
          .json({ message: `Groupe avec l'ID ${id} mis à jour avec succès` });
      }
    }
  );
});

// Supprimer un groupe par ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  connexion.query("DELETE FROM group_s WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    } else {
      res
        .status(200)
        .json({ message: `Groupe avec l'ID ${id} supprimé avec succès` });
    }
  });
});

// Récupérer les projets associés à un groupe par ID
router.get("/:id/projects", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT projects.id, projects.name 
    FROM projects 
    INNER JOIN project_groups ON projects.id = project_groups.project_id 
    WHERE project_groups.group_id = ?
  `;
  connexion.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Récupérer les membres associés à un groupe par ID
router.get("/:id/members", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT users.id, users.nom, users.prenom 
    FROM users 
    INNER JOIN user_groups ON users.id = user_groups.user_id 
    WHERE user_groups.group_id = ?
  `;
  connexion.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Assigner un projet à un groupe
router.post("/:id/projects", (req, res) => {
  const { id } = req.params;
  const { projectId } = req.body;
  connexion.query(
    "INSERT INTO project_groups (project_id, group_id) VALUES (?, ?)",
    [projectId, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne du serveur" });
      } else {
        res
          .status(201)
          .json({ message: "Projet assigné au groupe avec succès" });
      }
    }
  );
});

// Assigner un utilisateur à un groupe
router.post("/:id/members", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  connexion.query(
    "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)",
    [userId, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne du serveur" });
      } else {
        res
          .status(201)
          .json({ message: "Utilisateur assigné au groupe avec succès" });
      }
    }
  );
});

export default router;
