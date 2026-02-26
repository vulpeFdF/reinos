const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

// 1) Coloque aqui o endpoint do Formspree (vou explicar abaixo)
const FORMSPREE_URL = https://formspree.io/f/xgolddgq;

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Enviando...";

  const data = new FormData(form);

  try {
    const res = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) throw new Error("Falha no envio");

    form.reset();
    statusEl.textContent = "Mensagem enviada com sucesso.";
    // se quiser redirecionar:
    // window.location.href = "/obrigado.html";
  } catch (err) {
    statusEl.textContent = "Erro ao enviar. Tente novamente mais tarde.";
  }
});