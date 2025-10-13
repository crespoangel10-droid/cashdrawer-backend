// ✅ Cash Drawer App – Backend Oficial para Validar Accesos (by ChatGPT x Angel 2025)
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// --- Claves y datos de tu cuenta ---
const GUMROAD_API_KEY = process.env.GUMROAD_API_KEY || "QRH7xxxxxxxxxxxxxxxxxxxxxxxx";
const PRODUCT_ID = process.env.PRODUCT_ID || "opaoug";

// --- Endpoint principal para verificar acceso ---
app.get("/verify", async (req, res) => {
  const email = (req.query.email || "").toLowerCase().trim();
  if (!email) return res.json({ access: false, reason: "no_email_provided" });

  try {
    // 🔎 Consultar la API oficial de Gumroad para listar ventas del producto
    const response = await fetch(
      `https://api.gumroad.com/v2/sales?product_id=${PRODUCT_ID}`,
      {
        headers: { Authorization: `Bearer ${GUMROAD_API_KEY}` },
      }
    );

    const data = await response.json();

    // ⚙️ Buscar coincidencia del correo en ventas válidas (no reembolsadas)
    const match = data.sales?.find(
      (s) =>
        s.email?.toLowerCase() === email &&
        s.refunded === false &&
        (s.license_key_valid || true)
    );

    if (match) {
      console.log(`✅ Acceso autorizado: ${email}`);
      res.json({ access: true });
    } else {
      console.log(`🚫 Sin acceso: ${email}`);
      res.json({ access: false });
    }
  } catch (err) {
    console.error("❌ Error verificando Gumroad:", err);
    res.json({ access: false, error: "server_error" });
  }
});

// --- Endpoint de prueba rápida ---
app.get("/", (req, res) => {
  res.send("✅ Cash Drawer Backend está en línea y funcionando.");
});

// --- Puerto Render ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Cash Drawer Backend escuchando en puerto ${PORT}`)
);
