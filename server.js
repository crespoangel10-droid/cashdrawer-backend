import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === CONFIGURACIÓN ===
const GUMROAD_PRODUCT_ID = "opaoug";  // 👈 Tu ID de producto en Gumroad
const GUMROAD_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJlNzE5Y2E0MTg4YTQ5ZjlkYTRiN2FlODI0YjBiMWMwMmYyZmFjZTc0MmM5MGE5MzhmNTNkYjk1Y2FlZjE2NjQ3ZWYzYTBkNTVjNTE0MmY0NSIsImlhdCI6MTc1OTcyMjIwMy42NTQwMDQsIm5iZiI6MTc1OTcyMjIwMy42NTQwMDYsImV4cCI6MjA3NTI1NTAwMy42Mzc4NDUsInN1YiI6IjU2Mzk4NzUiLCJzY29wZXMiOltdfQ.aHj9AqxvxHRD7N106LXWyYv38Dm5CyErkeV4y7u9bkjG9cI40vSvMEevwMvBfHH-SAz2EOwWOfQu85ZiSH6NsmDRweiO6UJaDh5eTo8dCuu-3-tX8G28AQ7Z8Brp0bO42PgwEmGuGw8U1gknPxgP3qy8DoeELg-tKcnaqNb19ZHoGq4Oe-AaAb88YgEcQK6YzCd7-7CQftW6dlAluuHnE36LjqLju2c9aez_XXZXhRCtXqODlq0k7mHGvwDj_wfHUVzYamx6TaMpVf68Ygi_6M_ruHUtFoAWilSjGpp5oI9N1WB-EV5v0ZfWeVmtL_1fXNPHIdEMlo4t2te6xy7FqYWRbJsZ3YPxBvAU5iSQ67oWVXXq624WKJm0A1sbtuXsSdX6mX8kweYPXXXEJwbVFndSyEFbTY0D1hESWeVZA9DWB1_85EhvpvT4HyScv9gF2-Quf2e13Sa7LmwtM0D8nOzBY0qv4CuzqQTvPTD3rZh7DHcvwXRBFHajEhemfHLZGdZu_yTq8IszUOvoQcWLOS2jReX9JA7u92wu3SJWHTfJcldwem0LUdOzO4XTHzaJtD6dbyQ7GKr8RnivLkpA6hy2h3RgCjeQ9GUDBMsJfjoNQdgvGohZqDVTOzsNPg70Tf9WDYsBFtjmyjvWilNUPI0_KXMheIZy-Ym4nCPFJxM"; // 👈 Pega tu API Key aquí
const ALLOWED_EMAILS = [
  "crespo.angel10@gmail.com",
  "luigie7.lc@gmail.com"
];

// === TEST PRINCIPAL ===
app.get("/", (req, res) => {
  res.send("✅ CashDrawer backend funcionando correctamente 🚀");
});

// === ENDPOINT DE VERIFICACIÓN ===
app.get("/verify", async (req, res) => {
  const email = req.query.email?.toLowerCase();
  console.log("🔎 Verificando email:", email);

  if (!email)
    return res.json({ access: false, error: "Email requerido" });

  // 1️⃣ Si está en lista blanca (tú o Luigi)
  if (ALLOWED_EMAILS.includes(email)) {
    console.log("✅ Acceso permitido manualmente:", email);
    return res.json({ access: true });
  }

  // 2️⃣ Si no, consulta Gumroad
  try {
    const response = await fetch(
      `https://api.gumroad.com/v2/sales?product_id=${GUMROAD_PRODUCT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${GUMROAD_ACCESS_TOKEN}`
        }
      }
    );

    const data = await response.json();
    if (!data.success) {
      console.log("❌ Error al conectar con Gumroad:", data.message);
      return res.json({ access: false });
    }

    // Buscar si el email aparece entre los compradores
    const user = data.sales.find(sale => sale.email.toLowerCase() === email);

    if (user) {
      console.log("✅ Acceso permitido por Gumroad:", email);
      return res.json({ access: true });
    }

    console.log("🚫 Acceso denegado (no encontrado en Gumroad):", email);
    return res.json({ access: false });
  } catch (err) {
    console.error("⚠️ Error verificando en Gumroad:", err);
    return res.json({ access: false });
  }
});

// === PUERTO ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`✅ CashDrawer backend corriendo en puerto ${PORT}`)
);
