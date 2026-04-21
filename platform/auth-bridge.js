(function () {
  const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
  const REDIRECT_URL = window.location.href.split("#")[0];

  function $(id) {
    return document.getElementById(id);
  }

  function setAuthStatus(message, tone) {
    const node = $("authStatus");
    if (!node) return;
    node.textContent = message;
    node.className = "status-box" + (tone ? " " + tone : "");
  }

  async function signInViaRest(email, password) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        payload.error_description ||
        payload.msg ||
        payload.error ||
        `HTTP ${response.status}`;
      throw new Error(message);
    }
    return payload;
  }

  async function handleSignIn(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!email || !password) {
      setAuthStatus("Введите почту и пароль.", "error");
      return;
    }
    setAuthStatus("Проверяю логин и пароль...");
    try {
      const payload = await signInViaRest(email, password);
      if (!payload.access_token || !payload.refresh_token) {
        setAuthStatus("Сессия не получена. Попробуйте ещё раз.", "error");
        return;
      }
      await supabase.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token
      });
      setAuthStatus("Вход выполнен. Открываю платформу...", "success");
      window.location.assign(REDIRECT_URL);
    } catch (error) {
      setAuthStatus(error.message || "Не удалось выполнить вход.", "error");
    }
  }

  function bind() {
    if (window.__domNeonaBridgeBound) return;
    const form = $("signInForm");
    if (!form) return;
    window.__domNeonaBridgeBound = true;
    form.addEventListener("submit", handleSignIn, true);
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton?.addEventListener("click", (event) => {
      event.preventDefault();
      form.requestSubmit();
    }, true);
    submitButton?.addEventListener("click", () => {
      setTimeout(() => {
        if ($("authStatus")?.textContent?.includes("Готово к запуску")) {
          setAuthStatus("Готов к входу. Нажмите «Войти» ещё раз, если браузер прервал отправку.");
        }
      }, 400);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
  window.addEventListener("load", bind, { once: true });
})();
