import express from "express";
import connexion from "../database/connexion.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { emailTransporter } from "../utils/emailTransporter.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { nom, prenom, email, motDePasse } = req.body;
  if (!nom || !prenom || !email || !motDePasse) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const emailExistsQuery = "SELECT * FROM users WHERE email = ?";
    connexion.query(emailExistsQuery, [email], async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erreur lors de la vérification d'existance de l'email." });
      }
      if (result.length > 0) {
        return res.status(400).json({ error: "Email existe déjà." });
      }

      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      const verificationToken = uuidv4();

      const insertUserQuery =
        "INSERT INTO users (nom, prenom, email, password, verificationToken, compte_verifie) VALUES (?, ?, ?, ?, ?, 0)";
      connexion.query(
        insertUserQuery,
        [nom, prenom, email, hashedPassword, verificationToken],
        (err, result) => {
          if (err) {
            console.error(
              "Erreur lors de l'insertion de l'utilisateur dans la base de données:",
              err
            );
            return res
              .status(500)
              .json({
                error: "Erreur lors de l'inscription de l'utilisateur.",
              });
          }

          const verificationUrl = `http://localhost:8080/api/verify-email?token=${verificationToken}`;
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Veuillez vérifier votre adresse e-mail",
            text: `Cliquez sur le lien suivant pour vérifier votre adresse e-mail: ${verificationUrl}`,
          };

          emailTransporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              return res
                .status(500)
                .json({
                  error: "Erreur lors de l'envoi de l'email de vérification.",
                });
            }

            res
              .status(201)
              .json({
                message:
                  "Utilisateur inscrit avec succès. Veuillez vérifier votre email.",
              });
          });
        }
      );
    });
  } catch (error) {
    console.error("Erreur lors du hachage du mot de passe:", error);
    return res
      .status(500)
      .json({ error: "Erreur lors du hachage du mot de passe." });
  }
});

router.get("/verify-email", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .json({ error: "Le jeton de vérification est manquant." });
  }

  const verifyUserQuery = "SELECT * FROM users WHERE verificationToken = ?";
  connexion.query(verifyUserQuery, [token], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la vérification du jeton d'email." });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Jeton de vérification invalide." });
    }

    const updateVerificationQuery =
      "UPDATE users SET compte_verifie = 1, verificationToken = NULL WHERE verificationToken = ?";
    connexion.query(updateVerificationQuery, [token], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({
            error: "Erreur lors de la mise à jour du statut de vérification.",
          });
      }

      res.status(200).json({ message: "Email vérifié avec succès." });
    });
  });
});

router.post("/signin", (req, res) => {
  const { email, motDePasse } = req.body;
  if (!email || !motDePasse) {
    return res.status(400).json({ error: "Email and motDePasse are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  connexion.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error signing in user" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or mot de Passe" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(motDePasse, user.password);
    if (passwordMatch) {
      if (user.compte_verifie !== 1) {
        return res
          .status(401)
          .json({
            error:
              "Votre compte n'est pas vérifié. Veuillez vérifier votre email.",
          });
      }

      const token = jwt.sign({ _id: user._id }, "privatekey", {
        expiresIn: "24h",
      });
      res.json({ token, user });
    } else {
      res.status(401).json({ error: "email ou mot de passe incorrect" });
    }
  });
});
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'L\'adresse e-mail est requise.' });
  }

  const emailExistsQuery = 'SELECT * FROM users WHERE email = ?';
  connexion.query(emailExistsQuery, [email], (err, result) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'email dans la base de données:', err);
      return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email.' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cette adresse e-mail.' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const saveOtpQuery = 'UPDATE users SET otp = ? WHERE email = ?';
    connexion.query(saveOtpQuery, [otp, email], (err) => {
      if (err) {
        console.error('Erreur lors de la sauvegarde du OTP dans la base de données:', err);
        return res.status(500).json({ error: 'Erreur lors de la sauvegarde du OTP.' });
      }

      const mailOptions = {
        from: 'nadirmouradi.15@example.com',
        to: email,
        subject: 'Code de vérification',
        text: `Votre code de vérification est : ${otp}`
      };

      emailTransporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error('Erreur lors de l\'envoi de l\'e-mail de vérification:', err);
          return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'e-mail de vérification.' });
        }

        res.status(200).json({ success: true, message: 'Un code de vérification a été envoyé à votre adresse e-mail.' });
      });
    });
  });
});
router.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: 'Le code de vérification est requis.' });
  }

  const getUserQuery = 'SELECT * FROM users WHERE otp = ?';
  connexion.query(getUserQuery, [otp], (err, result) => {
    if (err) {
      console.error('Erreur lors de la vérification du OTP dans la base de données:', err);
      return res.status(500).json({ error: 'Erreur lors de la vérification du OTP.' });
    }
    if (result.length === 0) {
      return res.status(400).json({ error: 'Code de vérification invalide.' });
    }

    const user = result[0];
    const resetToken = uuidv4();

    const saveTokenQuery = 'UPDATE users SET resetToken = ?, otp = NULL WHERE otp = ?';
    connexion.query(saveTokenQuery, [resetToken, otp], (err) => {
      if (err) {
        console.error('Erreur lors de la sauvegarde du token de réinitialisation dans la base de données:', err);
        return res.status(500).json({ error: 'Erreur lors de la sauvegarde du token de réinitialisation.' });
      }

      res.status(200).json({ success: true, message: 'Code vérifié avec succès.', token: resetToken });
    });
  });
});
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'saisir le nouveau mot de passe.' });
  }

  try {
    const getUserQuery = 'SELECT * FROM users WHERE resetToken = ?';
    connexion.query(getUserQuery, [token], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la vérification du jeton de réinitialisation.' });
      }
      if (result.length === 0) {
        return res.status(400).json({ error: 'Jeton de réinitialisation invalide.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const updatePasswordQuery = 'UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?';
      connexion.query(updatePasswordQuery, [hashedPassword, token], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe.' });
        }

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
      });
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe.' });
  }
});




export default router;
