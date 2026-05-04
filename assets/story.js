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
  const res = await fetch("data/posts.json", { cache: "no-store" });
  return res.json();
}

function getId() {
  const url = new URL(location.href);
  return url.searchParams.get("id");
}

(async function init() {
  const id = getId();
  const posts = await loadPosts();
  const post = posts.find(p => p.id === id) || posts[0];
  trackView(post.id);

  document.title = `${post?.title || "Artigo"} • Reinos das Sombras`;

  // Dynamic meta tags for SEO
  const metaDesc = document.getElementById('metaDesc');
  const ogTitle = document.getElementById('ogTitle');
  const ogDesc = document.getElementById('ogDesc');
  const excerpt = post?.excerpt || post?.subtitle || (post?.content_html || '').replace(/<[^>]+>/g, '').slice(0, 160);
  if (metaDesc) metaDesc.setAttribute('content', excerpt);
  if (ogTitle) ogTitle.setAttribute('content', `${post?.title || 'Artigo'} • Reinos das Sombras`);
  if (ogDesc) ogDesc.setAttribute('content', excerpt);

  // Update canonical tag
  const canonical = document.getElementById('canonicalTag');
  if (canonical) canonical.setAttribute('href', `https://reinosdasombras.com.br/story.html?id=${encodeURIComponent(post.id)}`);

  // Fill breadcrumb
  const bcCat = document.getElementById('breadcrumbCategory');
  const bcTitle = document.getElementById('breadcrumbTitle');
  if (bcCat) bcCat.textContent = post.category || 'Artigos';
  if (bcTitle) bcTitle.textContent = post.title || '';

  // Inject JSON-LD schema for article (SEO)
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title || '',
    "description": excerpt,
    "author": {"@type": "Person", "name": "Corvis"},
    "publisher": {
      "@type": "Organization",
      "name": "Reinos das Sombras",
      "url": "https://reinosdasombras.com.br"
    },
    "datePublished": post.date || '',
    "url": `https://reinosdasombras.com.br/story.html?id=${encodeURIComponent(post.id)}`
  };
  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.textContent = JSON.stringify(schema);
  document.head.appendChild(schemaScript);

  // Update footer copyright
  const y = new Date().getFullYear();
  const footer = document.getElementById('footerCopy');
  if (footer) footer.textContent = `© ${y} REINOS DAS SOMBRAS`;

  const cover = document.getElementById("cover");
  const category = document.getElementById("category");
  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const content = document.getElementById("content");

  if (cover) {
  if (post.cover_image) {
    cover.style.backgroundImage = `url('${post.cover_image}')`;
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
