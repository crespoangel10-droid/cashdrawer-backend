// =============================================================
// 🚀 Cash Drawer Backend – Versión FINAL PRO (Render Ready)
// =============================================================

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

// ====================== CONFIGURACIÓN ======================
const SECRET_KEY = "CASHDRAWER_SUPER_SECRET_KEY_2025";
const LEMON_API_KEY = process.env.LEMON_API_KEY; // ⚙️ Clave privada Lemon Squeezy (no se pega aquí)
const PRODUCT_ID = "653636"; // 🧾 ID de tu producto Lemon
const ALLOWED_EMAILS = ["crespo.angel10@gmail.com"]; // 💎 acceso directo

// ====================== ENDPOINT PRINCIPAL ======================
app.get("/", (req, res) => {
  res.send("✅ Cash Drawer Backend funcionando perfectamente 🚀");
});

// ====================== FUNCIÓN DE VALIDACIÓN ======================
app.post("/verify", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ access: false, error: "Email requerido" });
  }

  const emailLower = email.toLowerCase();
  console.log(`📩 Verificando acceso para: ${emailLower}`);

  // 1️⃣ Acceso directo (tu email personal)
  if (ALLOWED_EMAILS.includes(emailLower)) {
    console.log("✅ Acceso directo autorizado (lista blanca)");
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "180d" });
    return res.json({ access: true, token });
  }

  // 2️⃣ Verificar licencia en Lemon Squeezy
  try {
    console.log("🔍 Consultando Lemon Squeezy...");
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses", {
      headers: {
        Authorization: `Bearer ${LEMON_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.log("⚠️ Error en la API de Lemon:", response.status);
      throw new Error("Fallo conexión Lemon Squeezy");
    }

    const data = await response.json();

    // Buscar licencias activas o trial del email
    const active = data.data.some((lic) => {
      const a = lic.attributes;
      const sameEmail = a.user_email?.toLowerCase() === emailLower;
      const sameProduct = String(a.product_id) === PRODUCT_ID;
      const activeStatus = ["active", "on_trial"].includes(a.status);
      return sameEmail && sameProduct && activeStatus;
    });

    if (active) {
      console.log("✅ Licencia activa o trial válida detectada");
      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "180d" });
      return res.json({ access: true, token });
    } else {
      console.log("❌ Sin licencia activa o trial");
      return res.json({ access: false });
    }
  } catch (err) {
    console.error("💥 Error al verificar licencia:", err.message);
    // si hay error de red, no bloquea
    return res.status(200).json({
      access: false,
      error: "Problema temporal con el servidor de verificación",
    });
  }
});

// ====================== PUERTO RENDER ======================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Cash Drawer PRO ejecutándose en puerto ${PORT}`);
});
