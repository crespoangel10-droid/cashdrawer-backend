import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

// --- Clave secreta para tokens (puedes cambiarla si quieres) ---
const SECRET_KEY = "CASHDRAWER_SUPER_SECRET_KEY";

// --- Emails con acceso gratuito ---
const allowedEmails = ["crespo.angel10@gmail.com", "demo@cashdrawer.com"]; 

// Ruta visible principal
app.get("/", (req, res) => {
  res.send("Servidor activo ✅ Cash Drawer Email + Token Access listo!");
});

// Ruta para generar token si el email está permitido
app.post("/verify", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Falta el email" });
  }

  // Si el email está permitido, genera token gratis
  if (allowedEmails.includes(email.toLowerCase())) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "365d" });
    return res.json({ success: true, token, message: "Acceso autorizado" });
  }

  // Si no está permitido, acceso denegado (para usuarios de pago)
  return res.json({ success: false, message: "Email no autorizado" });
});

// Verificación del token
app.post("/check-token", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: "Falta token" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ success: true, email: decoded.email });
  } catch (err) {
    res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
