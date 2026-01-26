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
  return `
    <a class="row" href="story.html?id=${encodeURIComponent(post.id)}">
      <div class="row-left">
        <div class="row-title">${post.title}</div>
        <div class="row-excerpt">${post.excerpt || ""}</div>
      </div>
      <div class="row-right">→</div>
    </a>
  `;
}

function setupMenu() {
  const drawer = document.getElementById("drawer");
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
  const open = document.getElementById("openSearch");
  const close = document.getElementById("closeSearch");
  const backdrop = document.getElementById("searchBackdrop");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");

  const show = () => { modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); input?.focus(); };
  const hide = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); input.value=""; results.innerHTML=""; };

  open?.addEventListener("click", show);
  close?.addEventListener("click", hide);
  backdrop?.addEventListener("click", hide);

  input?.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ""; return; }

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

  const posts = await loadPosts();
  const featured = posts.filter(p => p.is_featured);
  const recent = posts.filter(p => !p.is_featured);

  const featuredGrid = document.getElementById("featuredGrid");
  const recentList = document.getElementById("recentList");

  featuredGrid.innerHTML = (featured.length ? featured : posts.slice(0, 3)).map(cardHTML).join("");
  recentList.innerHTML = (recent.length ? recent : posts).slice(0, 6).map(rowHTML).join("");

  // copyright automático
  const y = new Date().getFullYear();
  const footer = document.getElementById("footerCopy");
  if (footer) footer.textContent = `© ${y} REINOS DAS SOMBRAS`;

  setupSearch(posts);
})();
