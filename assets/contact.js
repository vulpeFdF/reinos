(() => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");

  // coloque aqui seu endpoint do Formspree:
  const FORMSPREE_URL = "https://formspree.io/f/xgolddgq";

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

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