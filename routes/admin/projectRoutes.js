import express from "express";
import connexion from "../../database/connexion.js";

const router = express.Router();

// Récupérer tous les projets
router.get("/", (req, res) => {
  connexion.query("SELECT * FROM projects", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Récupérer un projet par ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  connexion.query(
    "SELECT * FROM projects WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne du serveur" });
      } else if (results.length === 0) {
        res.status(404).json({ error: `Projet avec l'ID ${id} non trouvé` });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// Créer un nouveau projet
router.post("/", (req, res) => {
  const { name, description, start_date, end_date } = req.body;
  connexion.query(
    "INSERT INTO projects (name, description, start_date, end_date) VALUES (?, ?, ?, ?)",
    [name, description, start_date, end_date],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne du serveur" });
      } else {
        res
          .status(201)
          .json({ message: "Projet créé avec succès", id: result.insertId });
      }
    }
  );
});

// Mettre à jour un projet par ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date } = req.body;
  connexion.query(
    "UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ? WHERE id = ?",
    [name, description, start_date, end_date, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne du serveur" });
      } else {
        res
          .status(200)
          .json({ message: `Projet avec l'ID ${id} mis à jour avec succès` });
      }
    }
  );
});

// Supprimer un projet par ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  connexion.query("DELETE FROM projects WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur interne du serveur" });
    } else {
      res
        .status(200)
        .json({ message: `Projet avec l'ID ${id} supprimé avec succès` });
    }
  });
});

export default router;
