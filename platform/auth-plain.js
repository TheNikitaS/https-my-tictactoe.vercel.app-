(() => {
  const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";

  function setStatus(message, tone = "") {
    const box = document.getElementById("authStatus");
    if (!box) return;
    box.textContent = message;
    box.classList.remove("status-success", "status-error");
    if (tone === "success") box.classList.add("status-success");
    if (tone === "error") box.classList.add("status-error");
  }

  function whenReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  async function init() {
    const supabaseLib = window.supabase;
    const form = document.getElementById("signInForm");
    if (!supabaseLib || !form) return;

    const authClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      if (!email || !password) {
        setStatus("Введите почту и пароль.", "error");
        return;
      }

      if (submitButton) submitButton.disabled = true;
      setStatus("Проверяю логин и пароль...");

      try {
        const { data, error } = await authClient.auth.signInWithPassword({ email, password });
        if (error) {
          setStatus(error.message || "Не удалось выполнить вход.", "error");
          return;
        }

        const session = data?.session;
        if (!session) {
          setStatus("Сессия не создалась после входа.", "error");
          return;
        }

        setStatus("Вход выполнен. Открываю платформу...", "success");
        window.setTimeout(() => {
          window.location.reload();
        }, 150);
      } catch (error) {
        setStatus(error?.message || "Не удалось выполнить вход.", "error");
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  whenReady(init);
})();
