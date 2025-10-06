import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "CASHDRAWER_SUPER_SECRET_KEY";
const LEMON_API_KEY = process.env.LEMON_API_KEY;
const PRODUCT_ID = "653636";
const allowedEmails = ["crespo.angel10@gmail.com"];

app.get("/", (req, res) => {
  res.send("✅ Cash Drawer Backend funcionando correctamente 🚀");
});

app.post("/verify", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ access: false, error: "Email requerido" });

  const emailLower = email.toLowerCase();

  // Acceso directo por lista blanca
  if (allowedEmails.includes(emailLower)) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "30d" });
    return res.json({ access: true, token });
  }

  // Verificación con Lemon Squeezy
  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses", {
      headers: {
        Authorization: `Bearer ${LEMON_API_KEY}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    const active = data.data?.some((lic) => {
      const attrs = lic.attributes;
      const matchEmail = attrs.user_email.toLowerCase() === emailLower;
      const matchProduct = attrs.product_id == PRODUCT_ID;
      const activeStatus = ["active", "on_trial"].includes(attrs.status);
      return matchEmail && matchProduct && activeStatus;
    });

    if (active) {
      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "30d" });
      return res.json({ access: true, token });
    } else {
      return res.json({ access: false });
    }
  } catch (err) {
    console.error("Error Lemon:", err);
    return res.status(200).json({ access: false, error: "Problema con Lemon Squeezy" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));
