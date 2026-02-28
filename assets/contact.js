(() => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");

  // Cloudflare Pages: use um endpoint externo (ex.: Formspree).
  // Troque a URL abaixo pela sua (ex.: https://formspree.io/f/abcdwxyz)
  const FORMSPREE_URL = "https://formspree.io/f/xgolddgq";

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (FORMSPREE_URL.includes("SEU_ID_AQUI")) {
      if (statusEl) statusEl.textContent = "Configuração pendente: adicione sua URL do Formspree em assets/contact.js.";
      return;
    }

    if (statusEl) statusEl.textContent = "Enviando...";

    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) throw new Error("Falha no envio");

      form.reset();
      if (statusEl) statusEl.textContent = "Mensagem enviada com sucesso.";

      // Se quiser redirecionar:
      // window.location.href = "/obrigado.html";
    } catch (err) {
      if (statusEl) statusEl.textContent = "Erro ao enviar. Tente novamente mais tarde.";
    }
  });
})();