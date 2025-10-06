import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.LEMON_API_KEY; // protegida en Render

app.post("/verify", async (req, res) => {
  const { licenseKey } = req.body;
  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ license_key: licenseKey })
    });
    const data = await response.json();
    if (data.valid) {
      res.json({ status: "active" });
    } else {
      res.json({ status: "inactive" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "API Error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
