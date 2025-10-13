import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const FILE_PATH = "./users.json";

// ✅ Correos con acceso permanente
const ADMIN_EMAILS = ["crespo.angel10@gmail.com", "luigie7.lc@gmail.com"];

// === Helpers ===
const loadUsers = () => (fs.existsSync(FILE_PATH) ? JSON.parse(fs.readFileSync(FILE_PATH)) : []);
const saveUsers = (data) => fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

// === Webhook Gumroad ===
app.post("/webhook", (req, res) => {
  const event = req.body;
  const email = (event.email || event.purchaser_email || "").toLowerCase();
  const action = event.action || "sale";
  const isTrial = event.is_free_trial === true;

  if (!email) return res.status(400).json({ error: "Missing email" });

  let users = loadUsers();
  const expires = new Date();
  expires.setDate(expires.getDate() + (isTrial ? 3 : 30)); // trial = 3 días, pago = 30 días

  let user = users.find((u) => u.email === email);

  if (action === "sale" || action === "renewal" || isTrial) {
    if (user) {
      user.active = true;
      user.plan = isTrial ? "trial" : "paid";
      user.expires = expires.toISOString();
    } else {
      users.push({
        email,
        active: true,
        plan: isTrial ? "trial" : "paid",
        expires: expires.toISOString(),
      });
    }
  }

  saveUsers(users);
  res.json({ success: true });
});

// === Verificar acceso ===
app.get("/verify/:email", (req, res) => {
  const email = req.params.email.toLowerCase();

  // 🔐 Admins siempre tienen acceso
  if (ADMIN_EMAILS.includes(email)) {
    return res.json({ access: true, plan: "admin" });
  }

  const users = loadUsers();
  const user = users.find((u) => u.email === email);

  if (!user) return res.json({ access: false });

  const now = new Date();
  const exp = new Date(user.expires);

  if (exp < now) {
    user.active = false;
    saveUsers(users);
    return res.json({ access: false });
  }

  res.json({ access: user.active, plan: user.plan });
});

// === Redirección a Gumroad si no paga ===
app.get("/check/:email", (req, res) => {
  const email = req.params.email.toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email === email);

  if (!user || !user.active) {
    return res.redirect("https://crespoangel.gumroad.com/l/opaoug");
  }

  res.send("✅ Access granted to Cash Drawer Calculator + IVU");
});

// === Servidor Render ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ CashDrawer backend running on port ${PORT}`));
