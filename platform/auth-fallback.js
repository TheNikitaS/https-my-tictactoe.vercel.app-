import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const REDIRECT_URL = window.location.href.split("#")[0];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

function $(id) {
  return document.getElementById(id);
}

function setAuthStatus(message, tone = "") {
  const node = $("authStatus");
  if (!node) return;
  node.textContent = message;
  node.className = `status-box${tone ? ` ${tone}` : ""}`;
}

function showAuthPane(key) {
  const tabs = $("authTabs");
  if (!tabs) return;
  tabs.querySelectorAll("[data-auth-pane]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authPane === key);
  });
  document.querySelectorAll(".auth-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.id === `pane-${key}`);
  });
}

function bindPaneButtons() {
  const tabs = $("authTabs");
  tabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-pane]");
    if (!button) return;
    showAuthPane(button.dataset.authPane);
  });
  document.querySelectorAll("[data-auth-pane-trigger]").forEach((button) => {
    button.addEventListener("click", () => showAuthPane(button.dataset.authPaneTrigger));
  });
}

async function handleSignIn(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  setAuthStatus("Проверяю логин и пароль...");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "")
    });
    if (error) {
      setAuthStatus(error.message || "Не удалось выполнить вход.", "error");
      return;
    }
    if (!data?.session) {
      setAuthStatus("Сессия создана, перезагружаю платформу...", "success");
      window.location.reload();
      return;
    }
    setAuthStatus("Вход выполнен. Открываю платформу...", "success");
    window.location.reload();
  } catch (error) {
    setAuthStatus(error.message || "Не удалось выполнить вход.", "error");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  setAuthStatus("Создаю учетную запись...");
  try {
    const { error } = await supabase.auth.signUp({
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      options: {
        data: {
          display_name: String(formData.get("displayName") || "").trim()
        }
      }
    });
    if (error) {
      setAuthStatus(error.message || "Не удалось создать учетную запись.", "error");
      return;
    }
    setAuthStatus("Аккаунт создан. Проверьте почту для подтверждения и входа.", "success");
  } catch (error) {
    setAuthStatus(error.message || "Не удалось создать учетную запись.", "error");
  }
}

async function handleOtpRequest(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  setAuthStatus("Отправляю код на почту...");
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: String(formData.get("email") || "").trim(),
      options: { shouldCreateUser: false }
    });
    if (error) {
      setAuthStatus(error.message || "Не удалось отправить код.", "error");
      return;
    }
    setAuthStatus("Код отправлен. Введите его в нижнюю форму.", "success");
  } catch (error) {
    setAuthStatus(error.message || "Не удалось отправить код.", "error");
  }
}

async function handleOtpVerify(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  setAuthStatus("Подтверждаю код...");
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: String(formData.get("email") || "").trim(),
      token: String(formData.get("token") || "").trim(),
      type: "email"
    });
    if (error) {
      setAuthStatus(error.message || "Не удалось подтвердить код.", "error");
      return;
    }
    if (data?.session) {
      setAuthStatus("Код подтвержден. Открываю платформу...", "success");
      window.location.reload();
      return;
    }
    setAuthStatus("Код подтвержден. Вход выполнен.", "success");
  } catch (error) {
    setAuthStatus(error.message || "Не удалось подтвердить код.", "error");
  }
}

async function handleResetRequest(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  setAuthStatus("Отправляю письмо для восстановления...");
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get("email") || "").trim(), {
      redirectTo: REDIRECT_URL
    });
    if (error) {
      setAuthStatus(error.message || "Не удалось отправить письмо.", "error");
      return;
    }
    setAuthStatus("Письмо для восстановления отправлено.", "success");
  } catch (error) {
    setAuthStatus(error.message || "Не удалось отправить письмо.", "error");
  }
}

async function handleUpdatePassword(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  setAuthStatus("Сохраняю новый пароль...");
  try {
    const { error } = await supabase.auth.updateUser({
      password: String(formData.get("password") || "")
    });
    if (error) {
      setAuthStatus(error.message || "Не удалось сохранить пароль.", "error");
      return;
    }
    setAuthStatus("Новый пароль сохранен. Теперь можно войти.", "success");
  } catch (error) {
    setAuthStatus(error.message || "Не удалось сохранить пароль.", "error");
  }
}

function bindFallbackAuth() {
  if (window.__domNeonaAuthBound || window.__domNeonaAuthFallbackBound) return;
  window.__domNeonaAuthFallbackBound = true;
  bindPaneButtons();
  $("signInForm")?.addEventListener("submit", handleSignIn);
  $("registerForm")?.addEventListener("submit", handleRegister);
  $("otpRequestForm")?.addEventListener("submit", handleOtpRequest);
  $("otpVerifyForm")?.addEventListener("submit", handleOtpVerify);
  $("resetRequestForm")?.addEventListener("submit", handleResetRequest);
  $("updatePasswordForm")?.addEventListener("submit", handleUpdatePassword);
}

window.setTimeout(bindFallbackAuth, 250);
