import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const SECRET_KEY = "CASHDRAWER_SUPER_SECRET_KEY";
const allowedEmails = ["crespo.angel10@gmail.com", "demo@cashdrawer.com"];

app.get("/", (req, res) => {
  res.send("Servidor activo ✅ Cash Drawer conectado correctamente");
});

app.post("/verify", (req, res) => {
  let email = req.body?.email?.trim().toLowerCase();
  if (!email) return res.json({ access: false, reason: "no-email" });

  const ok = allowedEmails.some(e => e.toLowerCase() === email);
  if (ok) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });
    res.json({ access: true, token });
  } else {
    res.json({ access: false });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
