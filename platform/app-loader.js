import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const PLATFORM_BUILD = "20260421-platform-suite68";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

function setAuthStatus(message, tone = "") {
  const node = document.getElementById("authStatus");
  if (!node) return;
  node.textContent = message;
  node.className = `status-box${tone ? ` ${tone}` : ""}`;
}

async function loadAppIfSessionExists() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setAuthStatus(error.message || "Не удалось проверить сессию.", "error");
      return;
    }
    if (!data?.session) return;
    setAuthStatus("Сессия найдена. Загружаю платформу...", "success");
    await import(`./app.js?v=${PLATFORM_BUILD}`);
  } catch (error) {
    console.error("app-loader bootstrap failed", error);
    setAuthStatus(error.message || "Не удалось запустить платформу.", "error");
  }
}

void loadAppIfSessionExists();
