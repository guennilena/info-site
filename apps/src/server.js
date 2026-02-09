import express from "express";
import { Pool } from "pg";

const app = express();
const pool = new Pool(); // nutzt PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE automatisch

app.get("/", async (req, res) => {
  const r = await pool.query("select now() as now");
  res.type("text").send(`OK apps. DB time: ${r.rows[0].now}\n`);
});

app.listen(3000, () => console.log("apps listening on :3000"));
