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

  document.title = `${post?.title || "Artigo"} • Reinos das Sombras`;

  const cover = document.getElementById("cover");
  const category = document.getElementById("category");
  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const content = document.getElementById("content");

  if (cover) cover.style.backgroundImage = `url('${post.cover_image || ""}')`;
  if (category) category.textContent = (post.category || "").toUpperCase();
  if (title) title.textContent = post.title || "";
  if (subtitle) subtitle.textContent = post.subtitle || "";
  if (content) content.innerHTML = post.content_html || "<p>(Sem conteúdo)</p>";
})();
