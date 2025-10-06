import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

// === Clave secreta para token ===
const SECRET_KEY = "CASHDRAWER_SUPER_SECRET_KEY";

// === Lista de emails permitidos ===
const allowedEmails = [
  "crespo.angel10@gmail.com", // tu correo
  "demo@cashdrawer.com"
];

// === Ruta principal visible ===
app.get("/", (req, res) => {
  res.send("Servidor activo ✅ Cash Drawer Email + Token Access listo!");
});

// === Ruta para verificar acceso por email ===
app.post("/verify", (req, res) => {
  let { email } = req.body;

  if (!email) return res.json({ access: false, error: "No email provided" });

  // Normaliza el formato del correo
  email = email.trim().toLowerCase();

  // Verifica si el email está en la lista permitida
  const isAllowed = allowedEmails.some(e => e.toLowerCase() === email);

  if (isAllowed) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });
    res.json({ access: true, token });
  } else {
    res.json({ access: false });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
