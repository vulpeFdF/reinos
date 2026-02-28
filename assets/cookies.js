(function(){
  const STORAGE_KEY = "rs_cookie_consent_v1";

  // >>> TROQUE AQUI <<<
  const GA_MEASUREMENT_ID = "G-2XC2ZVDQF6";      // ex: G-ABC123DEF4
  const ADSENSE_CLIENT_ID = "pub-8025127218"; // ex: ca-pub-1234567890

  function getConsent(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch { return null; }
  }

  function setConsent(consent){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  }

  function loadGA(){
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.includes("X")) return;

    // gtag.js
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function loadAdSense(){
    if (!ADSENSE_CLIENT_ID || ADSENSE_CLIENT_ID.includes("X")) return;

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    s.setAttribute("data-ad-client", ADSENSE_CLIENT_ID);
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }

  function applyConsent(consent){
    // essenciais sempre ok
    if (consent?.analytics) loadGA();
    if (consent?.ads) loadAdSense();
  }

  function buildBanner(){
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.innerHTML = `
      <h3>Cookies & Privacidade</h3>
      <p>
        Usamos cookies essenciais e, com sua permissão, cookies de <strong>análise</strong> (Google Analytics)
        e <strong>publicidade</strong> (Google AdSense). Você pode gerenciar suas preferências a qualquer momento.
        <a href="politica-de-privacidade.html" style="color:rgba(255,255,255,.85); text-decoration:underline;">Saiba mais</a>.
      </p>
      <div class="cookie-actions">
        <button class="cookie-btn" data-action="prefs">Preferências</button>
        <button class="cookie-btn" data-action="reject">Recusar</button>
        <button class="cookie-btn primary" data-action="accept">Aceitar</button>
      </div>
    `;
    return banner;
  }

  function buildModal(){
    const modal = document.createElement("div");
    modal.className = "cookie-modal";
    modal.innerHTML = `
      <div class="panel">
        <h3 style="margin:0 0 10px; letter-spacing:.18em; text-transform:uppercase; font-size:12px; color:rgba(255,255,255,.85);">
          Preferências de cookies
        </h3>

        <div class="cookie-row">
          <div>
            <strong>Essenciais</strong>
            <small>Necessários para funcionamento e segurança. Sempre ativos.</small>
          </div>
          <div class="cookie-toggle">
            <input type="checkbox" checked disabled />
            <span>Ativo</span>
          </div>
        </div>

        <div class="cookie-row">
          <div>
            <strong>Analíticos</strong>
            <small>Google Analytics: mede uso do site para melhorias.</small>
          </div>
          <label class="cookie-toggle">
            <input id="cc-analytics" type="checkbox" />
            <span>Permitir</span>
          </label>
        </div>

        <div class="cookie-row">
          <div>
            <strong>Publicidade</strong>
            <small>Google AdSense: exibição e medição de anúncios.</small>
          </div>
          <label class="cookie-toggle">
            <input id="cc-ads" type="checkbox" />
            <span>Permitir</span>
          </label>
        </div>

        <div class="cookie-actions" style="margin-top:14px;">
          <button class="cookie-btn" data-action="close">Fechar</button>
          <button class="cookie-btn primary" data-action="save">Salvar</button>
        </div>
      </div>
    `;
    return modal;
  }

  function openModal(modal){ modal.classList.add("open"); }
  function closeModal(modal){ modal.classList.remove("open"); }

  function init(){
    const existing = getConsent();
    if (existing){
      applyConsent(existing);
      return;
    }

    const banner = buildBanner();
    const modal = buildModal();
    document.body.appendChild(banner);
    document.body.appendChild(modal);

    banner.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;

      if (action === "accept"){
        const consent = { essential: true, analytics: true, ads: true, ts: Date.now() };
        setConsent(consent);
        banner.remove();
        applyConsent(consent);
      }

      if (action === "reject"){
        const consent = { essential: true, analytics: false, ads: false, ts: Date.now() };
        setConsent(consent);
        banner.remove();
        applyConsent(consent);
      }

      if (action === "prefs"){
        openModal(modal);
      }
    });

    modal.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) {
        if (e.target === modal) closeModal(modal);
        return;
      }

      const action = btn.dataset.action;

      if (action === "close"){
        closeModal(modal);
      }

      if (action === "save"){
        const analytics = modal.querySelector("#cc-analytics")?.checked;
        const ads = modal.querySelector("#cc-ads")?.checked;
        const consent = { essential: true, analytics: !!analytics, ads: !!ads, ts: Date.now() };
        setConsent(consent);
        closeModal(modal);
        banner.remove();
        applyConsent(consent);
      }
    });

    // expõe função pra “Gerenciar cookies”
    window.CookieConsent = {
      openPreferences: () => openModal(modal),
      reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); }
    };
  }

  init();
})();