(function () {
  const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
  const PLATFORM_BUILD = "20260421-platform-suite71";

  function $(id) {
    return document.getElementById(id);
  }

  function setAuthStatus(message, tone) {
    const node = $("authStatus");
    if (!node) return;
    node.textContent = message;
    node.className = "status-box" + (tone ? " " + tone : "");
  }

  function buildRedirectUrl(session) {
    const url = new URL(window.location.href);
    url.searchParams.set("v", PLATFORM_BUILD);
    url.hash = "";
    const hash = new URLSearchParams({
      access_token: session.access_token || "",
      refresh_token: session.refresh_token || "",
      expires_in: String(session.expires_in || 3600),
      expires_at: String(session.expires_at || ""),
      token_type: session.token_type || "bearer",
      type: "signin"
    });
    return `${url.toString()}#${hash.toString()}`;
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
      setAuthStatus("Вход выполнен. Открываю платформу...", "success");
      window.location.replace(buildRedirectUrl(payload));
    } catch (error) {
      setAuthStatus(error.message || "Не удалось выполнить вход.", "error");
    }
  }

  function bindFallback() {
    if (window.__domNeonaAuthBridgeBound) return;
    const form = $("signInForm");
    if (!form) return;
    window.__domNeonaAuthBridgeBound = true;
    form.addEventListener("submit", handleSignIn, true);
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          form.requestSubmit();
        },
        true
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindFallback, { once: true });
  } else {
    bindFallback();
  }
  window.addEventListener("load", bindFallback, { once: true });
})();
