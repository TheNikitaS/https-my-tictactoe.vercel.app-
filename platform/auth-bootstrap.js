import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const PLATFORM_BUILD = "20260421-platform-suite71";
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

function showAuthScreen() {
  $("authScreen")?.classList.remove("d-none");
  $("appShell")?.classList.add("d-none");
}

async function loadPlatformIfSessionExists() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setAuthStatus(error.message || "Не удалось проверить сессию.", "error");
    return;
  }
  if (!data?.session) {
    showAuthScreen();
    return;
  }
  setAuthStatus("Сессия найдена. Загружаю платформу...", "success");
  try {
    await import(`./app.js?v=${PLATFORM_BUILD}`);
  } catch (importError) {
    console.error("platform app import failed", importError);
    showAuthScreen();
    setAuthStatus(importError.message || "Не удалось запустить платформу.", "error");
  }
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
      setAuthStatus("Сессия не создана. Попробуйте еще раз.", "error");
      return;
    }
    setAuthStatus("Вход выполнен. Открываю платформу...", "success");
    window.location.assign(`${REDIRECT_URL}?v=${PLATFORM_BUILD}`);
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
        emailRedirectTo: REDIRECT_URL,
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
  const email = String(formData.get("email") || "").trim();
  setAuthStatus("Отправляю код на почту...");
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: REDIRECT_URL }
    });
    if (error) {
      setAuthStatus(error.message || "Не удалось отправить код.", "error");
      return;
    }
    const verifyEmailField = document.querySelector('#otpVerifyForm [name="email"]');
    if (verifyEmailField) verifyEmailField.value = email;
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
      window.location.assign(`${REDIRECT_URL}?v=${PLATFORM_BUILD}`);
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

function bindAuthUi() {
  if (window.__domNeonaAuthBootstrapBound) return;
  window.__domNeonaAuthBootstrapBound = true;

  $("authTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-pane]");
    if (!button) return;
    showAuthPane(button.dataset.authPane);
  });

  document.querySelectorAll("[data-auth-pane-trigger]").forEach((button) => {
    button.addEventListener("click", () => showAuthPane(button.dataset.authPaneTrigger));
  });

  $("signInForm")?.addEventListener("submit", handleSignIn);
  $("registerForm")?.addEventListener("submit", handleRegister);
  $("otpRequestForm")?.addEventListener("submit", handleOtpRequest);
  $("otpVerifyForm")?.addEventListener("submit", handleOtpVerify);
  $("resetRequestForm")?.addEventListener("submit", handleResetRequest);
  $("updatePasswordForm")?.addEventListener("submit", handleUpdatePassword);
}

bindAuthUi();
void loadPlatformIfSessionExists();
