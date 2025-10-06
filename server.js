import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());

// Clave secreta para firmar los tokens (cámbiala si quieres)
const SECRET_KEY = "cashdrawer_secret_key_2025";

// Emails permitidos
const allowed = ["angel@gmail.com", "demo@cashdrawer.com"];

// Ruta visible principal
app.get("/", (req, res) => {
  res.send("Servidor activo con validación + token persistente ✅");
});

// Endpoint de verificación inicial por email
app.post("/verify", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ access: false, message: "Email requerido" });

  if (allowed.includes(email.toLowerCase())) {
    // Genera token válido por 30 días
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "30d" });
    return res.json({ access: true, token });
  } else {
    return res.status(403).json({ access: false, message: "Acceso denegado" });
  }
});

// Endpoint para validar token en futuras visitas
app.post("/validate", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false });

  try {
    jwt.verify(token, SECRET_KEY);
    return res.json({ valid: true });
  } catch (err) {
    return res.json({ valid: false });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
