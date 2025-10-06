import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Ruta principal visible
app.get("/", (req, res) => {
  res.send("✅ Servidor activo Cash Drawer Email Access");
});

// ✅ Endpoint de verificación por email
app.post("/verify", (req, res) => {
  const { email } = req.body;
  const allowed = ["angel@test.com", "demo@cashdrawer.com"]; // <-- emails gratis que tú eliges
  if (allowed.includes(email.toLowerCase())) {
    res.json({ access: true });
  } else {
    res.json({ access: false });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
