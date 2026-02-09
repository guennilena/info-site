// apps/src/server.js
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { Pool } from "pg";

const app = express();
const pool = new Pool(); // uses PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE

const DOC_ROOT = process.env.DOC_ROOT || "/srv/applications/docs";
const DB_PREFIX = process.env.DB_PREFIX || "/Volumes/applications";
const VPS_PREFIX = process.env.VPS_PREFIX || DOC_ROOT;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));
app.use(express.urlencoded({ extended: true }));

function mapDbPathToVpsPath(dbPath) {
  if (typeof dbPath !== "string") return null;
  if (dbPath.startsWith(DB_PREFIX + "/")) {
    return VPS_PREFIX + dbPath.slice(DB_PREFIX.length);
  }
  return null;
}

function safeResolveInsideDocRoot(filePath) {
  const abs = path.resolve(filePath);
  const root = path.resolve(DOC_ROOT);
  if (!abs.startsWith(root + path.sep)) return null;
  return abs;
}

// LIST: /  (extern: /apps because Caddy handle_path strips /apps)
app.get("/", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      application_id,
      company,
      position_title,
      applied_at,
      status,
      application_source,
      application_source_detail,
      last_doc_date,
      folder_path
    FROM public.v_applications_overview
    ORDER BY applied_at DESC
    LIMIT 200
  `);

  res.render("list", { rows });
});

// DETAIL: /:applicationId
app.get("/:applicationId", async (req, res) => {
  const { applicationId } = req.params;

  const head = await pool.query(
    `SELECT * FROM public.v_applications_overview WHERE application_id = $1`,
    [applicationId]
  );
  if (head.rowCount === 0) return res.status(404).send("Not found");

  const docs = await pool.query(
    `SELECT
       id AS document_id,
       doc_type,
       doc_date,
       title,
       file_path,
       created_at
     FROM public.documents
     WHERE application_id = $1
     ORDER BY doc_date DESC NULLS LAST, created_at DESC`,
    [applicationId]
  );

  res.render("detail", { appRow: head.rows[0], docs: docs.rows });
});

// UPDATE: status, application_source, application_source_detail
app.post("/:applicationId", async (req, res) => {
  const { applicationId } = req.params;
  const { status, application_source, application_source_detail } = req.body;

  await pool.query(
    `UPDATE public.applications
     SET
       status = $1,
       application_source = $2,
       application_source_detail = $3
     WHERE id = $4`,
    [
      (status ?? "").trim() || null,
      (application_source ?? "").trim() || null,
      (application_source_detail ?? "").trim() || null,
      applicationId,
    ]
  );

  res.redirect(`/${applicationId}`);
});

// PDF: stream from VPS path (mapped from DB /Volumes/applications prefix)
app.get("/:applicationId/docs/:documentId", async (req, res) => {
  const { documentId } = req.params;

  const r = await pool.query(
    `SELECT file_path FROM public.documents WHERE id = $1 LIMIT 1`,
    [documentId]
  );
  if (r.rowCount === 0) return res.status(404).send("Not found");

  const mapped = mapDbPathToVpsPath(r.rows[0].file_path);
  if (!mapped) return res.status(400).send("Unmapped path");

  const abs = safeResolveInsideDocRoot(mapped);
  if (!abs) return res.status(400).send("Invalid path");

  if (!fs.existsSync(abs)) return res.status(404).send("File missing on VPS");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${path.basename(abs)}"`
  );
  fs.createReadStream(abs).pipe(res);
});

app.listen(3000, () => console.log("apps listening on :3000"));
