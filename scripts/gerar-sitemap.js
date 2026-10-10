// Gera o sitemap.xml a partir do data/posts.json.
// Uso (na raiz do projeto):  node scripts/gerar-sitemap.js
//
// - Cada artigo vira  https://reinosdassombras.com.br/story?id=SLUG
// - lastmod = campo "date" do post
// - Páginas estáticas ficam na lista PAGINAS abaixo (edite o lastmod se alterar a página)

const fs = require("fs");
const path = require("path");

const SITE = "https://reinosdassombras.com.br";
const RAIZ = path.join(__dirname, "..");

const PAGINAS = [
  { loc: "/",                            lastmod: null,         changefreq: "weekly",  priority: "1.0" }, // lastmod = post mais recente
  { loc: "/sobre.html",                  lastmod: "2026-08-02", changefreq: "monthly", priority: "0.8" },
  { loc: "/contato.html",                lastmod: "2026-08-02", changefreq: "monthly", priority: "0.7" },
  { loc: "/Politica-de-privacidade.html", lastmod: "2026-08-02", changefreq: "monthly", priority: "0.6" },
  { loc: "/disclaimer.html",             lastmod: "2026-08-02", changefreq: "monthly", priority: "0.6" },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const posts = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "posts.json"), "utf8"));
if (!Array.isArray(posts) || posts.length === 0) {
  console.error("posts.json vazio ou inválido.");
  process.exit(1);
}

// validações
const vistos = new Set();
let erro = false;
for (const p of posts) {
  if (!p.id || !p.date) { console.error(`Post sem id/date: ${JSON.stringify(p.id || p.title)}`); erro = true; continue; }
  if (vistos.has(p.id)) { console.error(`id duplicado: ${p.id}`); erro = true; }
  vistos.add(p.id);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) console.warn(`Aviso: id fora do padrão a-z0-9-: ${p.id}`);
}
if (erro) process.exit(1);

const ordenados = [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
const maisRecente = ordenados[0].date;

const url = (loc, lastmod, changefreq, priority) =>
  `  <url>\n    <loc>${esc(SITE + loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

const blocos = [
  ...PAGINAS.map((p) => url(p.loc, p.lastmod || maisRecente, p.changefreq, p.priority)),
  ...ordenados.map((p) => url(`/story?id=${encodeURIComponent(p.id)}`, p.date, "monthly", "0.8")),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocos.join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml gerado: ${PAGINAS.length} páginas + ${ordenados.length} artigos.`);
