// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// === VARIABLES DE ENTORNO ===
const GUMROAD_API_KEY = process.env.GUMROAD_API_KEY;
const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID;

// === VALIDACIÓN DEL EMAIL ===
app.post('/validate', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ access: false, error: 'missing_email' });

    const response = await fetch(`https://api.gumroad.com/v2/sales?product_id=${GUMROAD_PRODUCT_ID}`, {
      headers: { Authorization: `Bearer ${GUMROAD_API_KEY}` }
    });

    if (!response.ok) {
      return res.status(response.status).json({ access: false, error: 'gumroad_api_error' });
    }

    const data = await response.json();
    const sales = data.sales || [];

    // Busca si el email aparece entre los compradores
    const match = sales.find(sale => sale.email && sale.email.toLowerCase() === email);

    if (match) {
      return res.json({ access: true, message: 'Access granted ✅' });
    } else {
      return res.json({ access: false, message: 'Access denied ❌' });
    }
  } catch (err) {
    console.error('Error en validación:', err);
    res.status(500).json({ access: false, error: 'server_error' });
  }
});

// === HEALTH CHECK ===
app.get('/', (req, res) => {
  res.send('✅ CashDrawer backend funcionando correctamente');
});

// === PUERTO ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
