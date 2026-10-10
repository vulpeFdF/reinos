// ===============================
// VIEW COUNTER (localStorage)
// ===============================
const VIEWS_KEY = "views_map";

function getViewsMap() {
  try {
    return JSON.parse(localStorage.getItem(VIEWS_KEY) || "{}");
  } catch {
    return {};
  }
}

function trackView(postId) {
  if (!postId) return;
  const map = getViewsMap();
  map[postId] = (map[postId] || 0) + 1;
  localStorage.setItem(VIEWS_KEY, JSON.stringify(map));
}
async function loadPosts() {
  const res = await fetch("/data/posts.json", { cache: "no-store" });
  return res.json();
}

function getId() {
  const url = new URL(location.href);
  return url.searchParams.get("id");
}

// ===============================
// SEO: canonical + meta tags dinâmicas
// URL pública de cada artigo: /story?id=SLUG
// (não existe canonical estática no story.html; ela nasce aqui, por artigo)
// ===============================
const SEO_SITE_URL = "https://reinosdassombras.com.br";
const SEO_SITE_NAME = "Reinos das Sombras";

function seoCanonicalUrl(id) {
  return `${SEO_SITE_URL}/story?id=${encodeURIComponent(id)}`;
}

// "images/x.png" -> "/images/x.png" (funciona em /story, /story/ etc.)
function seoAssetPath(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return "/" + String(path).replace(/^\/+/, "");
}

// versão absoluta e codificada (og:image / schema.org exigem URL absoluta)
function seoAbsoluteUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const encoded = seoAssetPath(path).split("/").map(encodeURIComponent).join("/");
  return SEO_SITE_URL + encoded;
}

function seoSetMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function seoSetCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// id ausente/desconhecido: sem conteúdo duplicado e fora do índice
function renderNotFound() {
  document.title = `Artigo não encontrado • ${SEO_SITE_NAME}`;
  seoSetMeta("name", "robots", "noindex, follow");

  const bc = document.querySelector(".breadcrumb");
  const cover = document.getElementById("cover");
  const title = document.getElementById("title");
  const content = document.getElementById("content");
  if (bc) bc.style.display = "none";
  if (cover) cover.style.display = "none";
  if (title) title.textContent = "Artigo não encontrado";
  if (content) content.innerHTML = '<p>Não encontramos este artigo. <a href="/">Voltar para a página inicial</a>.</p>';

  const footer = document.getElementById("footerCopy");
  if (footer) footer.textContent = `© ${new Date().getFullYear()} REINOS DAS SOMBRAS`;
}

(async function init() {
  const id = getId();

  let posts;
  try {
    posts = await loadPosts();
  } catch (e) {
    console.error("Falha ao carregar posts.json", e);
    return;
  }

  const post = Array.isArray(posts) ? posts.find(p => p.id === id) : null;
  if (!post) {
    renderNotFound();
    return;
  }
  trackView(post.id);

  const canonicalUrl = seoCanonicalUrl(post.id);
  const pageTitle = `${post.title || "Artigo"} • ${SEO_SITE_NAME}`;
  const excerpt = post.excerpt || post.subtitle || (post.content_html || "").replace(/<[^>]+>/g, "").slice(0, 160);
  const imageUrl = post.cover_image ? seoAbsoluteUrl(post.cover_image) : "";

  document.title = pageTitle;

  // Canonical + meta tags (description, Open Graph, Twitter)
  seoSetCanonical(canonicalUrl);
  seoSetMeta("name", "description", excerpt);
  seoSetMeta("property", "og:title", pageTitle);
  seoSetMeta("property", "og:description", excerpt);
  seoSetMeta("property", "og:url", canonicalUrl);
  seoSetMeta("name", "twitter:title", pageTitle);
  seoSetMeta("name", "twitter:description", excerpt);
  if (imageUrl) {
    seoSetMeta("property", "og:image", imageUrl);
    seoSetMeta("name", "twitter:image", imageUrl);
  }

  // Fill breadcrumb
  const bcCat = document.getElementById("breadcrumbCategory");
  const bcTitle = document.getElementById("breadcrumbTitle");
  if (bcCat) bcCat.textContent = post.category || "Artigos";
  if (bcTitle) bcTitle.textContent = post.title || "";

  // JSON-LD (schema.org Article)
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title || "",
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "description": excerpt,
    "author": { "@type": "Person", "name": "Corvis" },
    "publisher": {
      "@type": "Organization",
      "name": SEO_SITE_NAME,
      "url": SEO_SITE_URL
    },
    "datePublished": post.date || "",
    "dateModified": post.date || "",
    "inLanguage": "pt-BR",
    "url": canonicalUrl
  };
  if (imageUrl) schema.image = imageUrl;
  const schemaScript = document.createElement("script");
  schemaScript.type = "application/ld+json";
  schemaScript.textContent = JSON.stringify(schema);
  document.head.appendChild(schemaScript);

  // Update footer copyright
  const y = new Date().getFullYear();
  const footer = document.getElementById("footerCopy");
  if (footer) footer.textContent = `© ${y} REINOS DAS SOMBRAS`;

  const cover = document.getElementById("cover");
  const category = document.getElementById("category");
  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const content = document.getElementById("content");

  if (cover) {
    if (post.cover_image) {
      cover.style.backgroundImage = `url('${seoAssetPath(post.cover_image)}')`;
      cover.style.display = "block";
    } else {
      cover.style.display = "none";
    }
  }
  if (category) category.textContent = (post.category || "").toUpperCase();
  if (title) title.textContent = post.title || "";
  if (subtitle) subtitle.textContent = post.subtitle || "";
  if (content) content.innerHTML = post.content_html || "<p>(Sem conteúdo)</p>";
})();
