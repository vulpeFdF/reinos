async function loadPosts() {
  const res = await fetch("data/posts.json", { cache: "no-store" });
  return res.json();
}

function cardHTML(post) {
  return `
    <a class="card" href="story.html?id=${encodeURIComponent(post.id)}">
      <div class="card-img" style="background-image:url('${post.cover_image || ""}')"></div>
      <div class="card-body">
        <div class="card-kicker">${post.category || ""}</div>
        <div class="card-title">${post.title || ""}</div>
        <div class="card-excerpt">${post.excerpt || ""}</div>
        <div class="card-more">READ MORE →</div>
      </div>
    </a>
  `;
}

function rowHTML(post) {
  const cover = post.cover_image || "";
  return `
    <a class="feed-row" href="story.html?id=${encodeURIComponent(post.id)}">
      ${cover ? `<img class="feed-cover" src="${cover}" alt="${post.title || ""}">` : `<div></div>`}
      <div>
        <div class="feed-meta">${post.category || ""}</div>
        <div class="feed-title">${post.title || ""}</div>
        ${post.subtitle ? `<div class="feed-sub">${post.subtitle}</div>` : ""}
        <div class="feed-excerpt">${post.excerpt || ""}</div>
      </div>
    </a>
  `;
}

function setupMenu() {
  const drawer = document.getElementById("drawer");
  if (!drawer) return;
  const open = document.getElementById("openMenu");
  const close = document.getElementById("closeMenu");
  const backdrop = document.getElementById("drawerBackdrop");

  const show = () => { drawer.classList.add("open"); drawer.setAttribute("aria-hidden","false"); };
  const hide = () => { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); };

  open?.addEventListener("click", show);
  close?.addEventListener("click", hide);
  backdrop?.addEventListener("click", hide);
}

function setupSearch(posts) {
  const modal = document.getElementById("search");
  if (!modal) return;

  const open = document.getElementById("openSearch");
  const close = document.getElementById("closeSearch");
  const backdrop = document.getElementById("searchBackdrop");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");

  const show = () => { modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); input?.focus(); };
  const hide = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    if (input) input.value = "";
    if (results) results.innerHTML = "";
  };

  open?.addEventListener("click", show);
  close?.addEventListener("click", hide);
  backdrop?.addEventListener("click", hide);

  input?.addEventListener("input", () => {
    const q = (input.value || "").trim().toLowerCase();
    if (!q) { if (results) results.innerHTML = ""; return; }

    const filtered = posts.filter(p => (p.title || "").toLowerCase().includes(q));
    results.innerHTML = filtered.slice(0, 10).map(p => `
      <a class="search-item" href="story.html?id=${encodeURIComponent(p.id)}">
        <div class="search-item-title">${p.title || ""}</div>
        <div class="search-item-sub">${p.subtitle || p.excerpt || ""}</div>
      </a>
    `).join("");
  });
}

/**
 * HOME:
 * - Destaques: Top 3 por views (localStorage views_map), desempate por data (mais novo)
 * - Últimas publicações: mais recentes por data (mais novo), SEM repetir os destaques
 */
(async function init() {
  setupMenu();

  let posts = [];
  try {
    posts = await loadPosts();
    if (!Array.isArray(posts)) posts = [];
  } catch (e) {
    console.error("Falha ao carregar posts.json", e);
    posts = [];
  }

  // ordena por data/created_at (mais novo primeiro)
  const sortedByDate = [...posts].sort((a, b) => {
    const da = new Date(a.date || a.created_at || 0).getTime();
    const db = new Date(b.date || b.created_at || 0).getTime();
    return db - da;
  });

  // views_map (p/ "mais vistos")
  const views = (() => {
    try { return JSON.parse(localStorage.getItem("views_map") || "{}"); }
    catch { return {}; }
  })();

  // ordena por views (desc), desempate por data (desc)
  const sortedByViews = [...posts].sort((a, b) => {
    const va = Number(views[a.id] || 0);
    const vb = Number(views[b.id] || 0);
    if (vb !== va) return vb - va;

    const da = new Date(a.date || a.created_at || 0).getTime();
    const db = new Date(b.date || b.created_at || 0).getTime();
    return db - da;
  });

  // 🔥 Destaques (Top 3 por views). Fallback: Top 3 por data.
  const featuredPosts = (sortedByViews.length ? sortedByViews : sortedByDate).slice(0, 3);
  const featuredIds = new Set(featuredPosts.map(p => p.id));

  // 🕯️ Últimas publicações (por data), sem repetir os destaques
  const latestPosts = sortedByDate.filter(p => !featuredIds.has(p.id)).slice(0, 6);

  // RENDER (só se existir na página)
  const featuredGrid = document.getElementById("featuredGrid");
  const recentList = document.getElementById("recentList");

  if (featuredGrid) {
    featuredGrid.innerHTML = featuredPosts.map(cardHTML).join("");
  }

  if (recentList) {
    recentList.innerHTML = latestPosts.map(rowHTML).join("");
  }

  // copyright automático
  const y = new Date().getFullYear();
  const footer = document.getElementById("footerCopy");
  if (footer) footer.textContent = `© ${y} REINOS DAS SOMBRAS`;

  // busca funciona em qualquer página que tenha o modal
  setupSearch(sortedByDate);
})();

/**
 * POST ALEATÓRIO (não repete 2x seguidas)
 * Use no link: onclick="goRandomPost(); return false;"
 */
async function goRandomPost() {
  try {
    const res = await fetch("/data/posts.json", { cache: "no-store" });
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) return;

    const keyOf = (p) => p.id ?? p.slug ?? null;

    // Se só tem 1 post, vai nele mesmo
    if (posts.length === 1) {
      const only = posts[0];
      const k = keyOf(only);
      if (k) localStorage.setItem("last_random_post", String(k));
      if (only.id) return (window.location.href = `story.html?id=${encodeURIComponent(only.id)}`);
      if (only.slug) return (window.location.href = `story.html?slug=${encodeURIComponent(only.slug)}`);
      return;
    }

    const last = localStorage.getItem("last_random_post");

    // tenta evitar repetir o último
    let chosen = null;
    for (let i = 0; i < 10; i++) {
      const candidate = posts[Math.floor(Math.random() * posts.length)];
      const ck = keyOf(candidate);
      if (ck && ck !== last) {
        chosen = candidate;
        break;
      }
    }

    // fallback (caso tenha dado azar 10x)
    if (!chosen) chosen = posts[Math.floor(Math.random() * posts.length)];

    const chosenKey = keyOf(chosen);
    if (chosenKey) localStorage.setItem("last_random_post", String(chosenKey));

    if (chosen.id) {
      window.location.href = `story.html?id=${encodeURIComponent(chosen.id)}`;
    } else if (chosen.slug) {
      window.location.href = `story.html?slug=${encodeURIComponent(chosen.slug)}`;
    }
  } catch (err) {
    console.error("Erro ao selecionar post aleatório:", err);
  }
}