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
        <div class="card-title">${post.title}</div>
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
  const hide = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); if (input) input.value=""; if (results) results.innerHTML=""; };

  open?.addEventListener("click", show);
  close?.addEventListener("click", hide);
  backdrop?.addEventListener("click", hide);

  input?.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { if (results) results.innerHTML = ""; return; }

    const filtered = posts.filter(p => (p.title || "").toLowerCase().includes(q));
    results.innerHTML = filtered.slice(0, 10).map(p => `
      <a class="search-item" href="story.html?id=${encodeURIComponent(p.id)}">
        <div class="search-item-title">${p.title}</div>
        <div class="search-item-sub">${p.subtitle || p.excerpt || ""}</div>
      </a>
    `).join("");
  });
}

(async function init() {
  setupMenu();

  let posts = [];
  try {
    posts = await loadPosts();
  } catch (e) {
    console.error("Falha ao carregar posts.json", e);
    posts = [];
  }

  // ordena por data/created_at (mais novo primeiro)
  const sorted = [...posts].sort((a, b) => {
    const da = new Date(a.date || a.created_at || 0).getTime();
    const db = new Date(b.date || b.created_at || 0).getTime();
    return db - da;
  });

  // HOME (só roda se os blocos existirem)
  const featuredGrid = document.getElementById("featuredGrid");
  const recentList = document.getElementById("recentList");

  if (featuredGrid) {
    const featured = sorted.filter(p => p.is_featured);
    const fallback = sorted.slice(0, 3);
    featuredGrid.innerHTML = (featured.length ? featured : fallback).map(cardHTML).join("");
  }

  if (recentList) {
    const recent = sorted.filter(p => !p.is_featured);
    recentList.innerHTML = (recent.length ? recent : sorted).slice(0, 6).map(rowHTML).join("");
  }

  // copyright automático
  const y = new Date().getFullYear();
  const footer = document.getElementById("footerCopy");
  if (footer) footer.textContent = `© ${y} REINOS DAS SOMBRAS`;

  // busca funciona em qualquer página que tenha o modal
  setupSearch(sorted);
})();
