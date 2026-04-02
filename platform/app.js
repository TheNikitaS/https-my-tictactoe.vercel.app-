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

const DOM = {
  authScreen: document.getElementById("authScreen"),
  appShell: document.getElementById("appShell"),
  authTabs: document.getElementById("authTabs"),
  authStatus: document.getElementById("authStatus"),
  profileCard: document.getElementById("profileCard"),
  moduleNav: document.getElementById("moduleNav"),
  viewTitle: document.getElementById("viewTitle"),
  viewSubtitle: document.getElementById("viewSubtitle"),
  dashboardView: document.getElementById("dashboardView"),
  dashboardGrid: document.getElementById("dashboardGrid"),
  embedView: document.getElementById("embedView"),
  moduleFrame: document.getElementById("moduleFrame"),
  adminView: document.getElementById("adminView"),
  adminUsersBody: document.getElementById("adminUsersBody"),
  partnerDirectoryBody: document.getElementById("partnerDirectoryBody"),
  messengerView: document.getElementById("messengerView"),
  threadList: document.getElementById("threadList"),
  messagesList: document.getElementById("messagesList"),
  messageThreadTitle: document.getElementById("messageThreadTitle"),
  messageThreadMeta: document.getElementById("messageThreadMeta"),
  placeholderView: document.getElementById("placeholderView"),
  placeholderCard: document.getElementById("placeholderCard"),
  schemaWarningSection: document.getElementById("schemaWarningSection")
};

const STATE = {
  session: null,
  user: null,
  profile: null,
  schemaReady: true,
  schemaError: "",
  activeModule: "dashboard",
  users: [],
  partnerProfiles: [],
  threads: [],
  activeThreadId: null
};

const MODULES = {
  dashboard: {
    title: "Панель управления",
    subtitle: "Общий вход в калькуляторы, продажи, партнеров и новые модули платформы.",
    type: "dashboard"
  },
  sales: {
    title: "Продажи",
    subtitle: "Текущий рабочий модуль с заказами, ЗП и лид-метриками.",
    type: "embed",
    src: () => "../prodazhi/index.html"
  },
  my_calculator: {
    title: "Мой калькулятор",
    subtitle: "Личный расчет вывесок и связанные вкладки.",
    type: "embed",
    src: () => "../moy/index.html"
  },
  partner_calculator: {
    title: "Партнерский калькулятор",
    subtitle: "Персональный партнерский калькулятор с отдельным scope по ссылке.",
    type: "embed",
    src: () => {
      const slug = getCurrentPartnerSlug();
      return slug ? `../part/index.html?partner=${encodeURIComponent(slug)}` : "../part/index.html";
    }
  },
  light2: {
    title: "ЛАЙТ 2",
    subtitle: "Финансовый и операционный контур из рабочего файла ЛАЙТ 2.",
    type: "embed",
    src: () => "./light2/index.html?v=20260402-light2"
  },
  messenger: {
    title: "Мессенджер",
    subtitle: "Личные и групповые чаты команды.",
    type: "messenger"
  },
  admin: {
    title: "Админ-панель",
    subtitle: "Пользователи, роли, доступы и список партнеров.",
    type: "admin"
  },
  crm: {
    title: "CRM",
    subtitle: "Следующий модуль: продажи, карточки клиентов, интеграции и канбан.",
    type: "placeholder"
  },
  warehouse: {
    title: "Склад",
    subtitle: "Следующий модуль: остатки, закупки, продажи, финансы и аналитика.",
    type: "placeholder"
  },
  tasks: {
    title: "Тасктрекер",
    subtitle: "Следующий модуль: задачи, оценки, итерации и рабочие очереди.",
    type: "placeholder"
  },
  ai: {
    title: "Домовой Неоник",
    subtitle: "Корпоративный ИИ и база знаний компании.",
    type: "placeholder"
  }
};

const MODULE_GROUPS = [
  "dashboard",
  "sales",
  "my_calculator",
  "partner_calculator",
  "light2",
  "messenger",
  "admin",
  "crm",
  "warehouse",
  "tasks",
  "ai"
];

function setAuthStatus(message, tone = "") {
  DOM.authStatus.textContent = message;
  DOM.authStatus.className = `status-box${tone ? " " + tone : ""}`;
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function moduleListFromProfile() {
  if (STATE.profile?.role === "admin" || STATE.profile?.role === "owner") return MODULE_GROUPS;
  const raw = STATE.profile?.allowed_modules;
  if (Array.isArray(raw) && raw.length) {
    return raw.filter((key) => MODULES[key]);
  }
  if (STATE.schemaReady) {
    return ["dashboard", "sales", "my_calculator", "partner_calculator", "messenger"];
  }
  return ["dashboard", "sales", "my_calculator", "partner_calculator"];
}

function hasModuleAccess(key) {
  return moduleListFromProfile().includes(key);
}

function isAdmin() {
  return STATE.profile?.role === "admin" || STATE.profile?.role === "owner";
}

function getCurrentPartnerSlug() {
  if (STATE.profile?.partner_slug) return STATE.profile.partner_slug;
  const ownPartner = STATE.partnerProfiles.find((partner) => partner.owner_user_id === STATE.user?.id);
  return ownPartner?.slug || "";
}

function buildPartnerCalculatorUrl(slug) {
  return `../part/index.html?partner=${encodeURIComponent(slug)}`;
}

function isSchemaMissing(error) {
  const message = (error?.message || "").toLowerCase();
  return error?.code === "42P01" || message.includes("relation") || message.includes("app_profiles");
}

function showAuthPane(key) {
  const buttons = DOM.authTabs.querySelectorAll("[data-auth-pane]");
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authPane === key);
  });

  document.querySelectorAll(".auth-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.id === `pane-${key}`);
  });
}

function showAuthScreen() {
  DOM.authScreen.classList.remove("d-none");
  DOM.appShell.classList.add("d-none");
}

function showAppShell() {
  DOM.authScreen.classList.add("d-none");
  DOM.appShell.classList.remove("d-none");
}

function renderSchemaWarning() {
  if (STATE.schemaReady) {
    DOM.schemaWarningSection.innerHTML = "";
    return;
  }

  DOM.schemaWarningSection.innerHTML = `
    <div class="schema-warning">
      <strong>Платформа еще не инициализирована в Supabase.</strong>
      <div class="mt-2">Нужно выполнить SQL-файл <code>platform_setup.sql</code> в Supabase SQL Editor, после чего обновить страницу.</div>
      <div class="mt-2">Техническая деталь: ${escapeHtml(STATE.schemaError || "таблицы платформы не найдены")}</div>
    </div>
  `;
}

function renderProfileCard() {
  const displayName =
    STATE.profile?.display_name ||
    STATE.profile?.full_name ||
    STATE.user?.user_metadata?.display_name ||
    STATE.user?.email ||
    "Пользователь";

  const role = STATE.profile?.role || (STATE.schemaReady ? "user" : "standalone");
  const partnerSlug = getCurrentPartnerSlug();

  DOM.profileCard.innerHTML = `
    <div class="fw-bold">${escapeHtml(displayName)}</div>
    <div class="text-muted small mb-2">${escapeHtml(STATE.user?.email || "—")}</div>
    <span class="role-pill">${escapeHtml(role)}</span>
    <div class="small text-muted mt-3">Партнерский scope: ${escapeHtml(partnerSlug || "не привязан")}</div>
  `;
}

function renderModuleNav() {
  DOM.moduleNav.innerHTML = "";
  moduleListFromProfile().forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.moduleKey = key;
    button.classList.toggle("active", STATE.activeModule === key);
    button.textContent = MODULES[key].title;
    DOM.moduleNav.appendChild(button);
  });
}

function renderDashboard() {
  const cards = moduleListFromProfile()
    .filter((key) => key !== "dashboard")
    .map((key) => {
      const module = MODULES[key];
      return `
        <article class="module-card">
          <h3>${escapeHtml(module.title)}</h3>
          <p>${escapeHtml(module.subtitle)}</p>
          <div class="meta">Открыть модуль</div>
          <div class="mt-3">
            <button class="btn btn-dark btn-sm" type="button" data-dashboard-open="${escapeHtml(key)}">Открыть</button>
          </div>
        </article>
      `;
    });

  DOM.dashboardGrid.innerHTML = cards.join("");
}

function setViewMeta(title, subtitle) {
  DOM.viewTitle.textContent = title;
  DOM.viewSubtitle.textContent = subtitle;
}

function hideViews() {
  DOM.dashboardView.classList.add("d-none");
  DOM.embedView.classList.add("d-none");
  DOM.adminView.classList.add("d-none");
  DOM.messengerView.classList.add("d-none");
  DOM.placeholderView.classList.add("d-none");
}

async function openModule(key) {
  if (!hasModuleAccess(key)) return;
  STATE.activeModule = key;
  renderModuleNav();

  const module = MODULES[key];
  setViewMeta(module.title, module.subtitle);
  hideViews();

  if (module.type === "dashboard") {
    renderDashboard();
    DOM.dashboardView.classList.remove("d-none");
    return;
  }

  if (module.type === "embed") {
    const src = typeof module.src === "function" ? module.src() : module.src;
    DOM.moduleFrame.src = src;
    DOM.embedView.classList.remove("d-none");
    return;
  }

  if (module.type === "admin") {
    DOM.adminView.classList.remove("d-none");
    await loadAdminData();
    return;
  }

  if (module.type === "messenger") {
    DOM.messengerView.classList.remove("d-none");
    await loadThreads();
    return;
  }

  DOM.placeholderCard.innerHTML = `
    <h3>${escapeHtml(module.title)}</h3>
    <p class="mb-2">${escapeHtml(module.subtitle)}</p>
    <p class="mb-0 text-muted">Модуль уже заложен в платформу как место подключения. Следующим этапом сюда будем переносить бизнес-логику из ваших процессов и Excel-файлов.</p>
  `;
  DOM.placeholderView.classList.remove("d-none");
}

async function ensureProfile(user) {
  const { data, error } = await supabase
    .from("app_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (data) return data;

  const displayName = user.user_metadata?.display_name || user.email || "Пользователь";
  const insertPayload = {
    id: user.id,
    email: user.email,
    full_name: displayName,
    display_name: displayName
  };

  const { data: inserted, error: insertError } = await supabase
    .from("app_profiles")
    .upsert(insertPayload)
    .select("*")
    .single();

  if (insertError) throw insertError;
  return inserted;
}

async function loadPartnerProfiles() {
  if (!STATE.schemaReady) return;
  const { data, error } = await supabase
    .from("partner_profiles")
    .select("*")
    .order("display_name", { ascending: true });

  if (error) throw error;
  STATE.partnerProfiles = data || [];
}

async function bootstrapApp(session) {
  STATE.session = session;
  STATE.user = session.user;
  STATE.schemaReady = true;
  STATE.schemaError = "";

  try {
    STATE.profile = await ensureProfile(session.user);
    if (isAdmin()) {
      await loadPartnerProfiles();
    } else {
      STATE.partnerProfiles = [];
    }
  } catch (error) {
    if (isSchemaMissing(error)) {
      STATE.schemaReady = false;
      STATE.schemaError = error.message || "таблицы платформы не найдены";
      STATE.profile = {
        display_name: session.user.user_metadata?.display_name || session.user.email,
        role: "user",
        allowed_modules: ["dashboard", "sales", "my_calculator", "partner_calculator"]
      };
    } else {
      throw error;
    }
  }

  renderSchemaWarning();
  renderProfileCard();
  renderModuleNav();
  renderDashboard();
  showAppShell();
  await openModule("dashboard");
}

function renderUserTable() {
  if (!STATE.users.length) {
    DOM.adminUsersBody.innerHTML = `<tr><td colspan="7" class="text-muted">Пользователи пока не найдены.</td></tr>`;
    return;
  }

  DOM.adminUsersBody.innerHTML = STATE.users
    .map((user) => {
      const modules = Array.isArray(user.allowed_modules) ? user.allowed_modules.join(", ") : "";
      const roleOptions = ["owner", "admin", "manager", "partner", "staff", "viewer", "user"]
        .map((role) => `<option value="${role}" ${role === user.role ? "selected" : ""}>${role}</option>`)
        .join("");

      return `
        <tr data-user-id="${escapeHtml(user.id)}">
          <td class="small">${escapeHtml(user.email || "—")}</td>
          <td><input class="form-control form-control-sm" name="display_name" value="${escapeHtml(user.display_name || user.full_name || "")}" /></td>
          <td><select class="form-select form-select-sm" name="role">${roleOptions}</select></td>
          <td><input class="form-control form-control-sm" name="partner_slug" value="${escapeHtml(user.partner_slug || "")}" /></td>
          <td><input class="form-control form-control-sm" name="allowed_modules" value="${escapeHtml(modules)}" /></td>
          <td class="text-center"><input class="form-check-input" type="checkbox" name="is_active" ${user.is_active ? "checked" : ""} /></td>
          <td><button class="btn btn-sm btn-outline-dark" type="button" data-save-user="${escapeHtml(user.id)}">Сохранить</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderPartnerDirectory() {
  if (!STATE.partnerProfiles.length) {
    DOM.partnerDirectoryBody.innerHTML = `<tr><td colspan="5" class="text-muted">Партнеры пока не добавлены.</td></tr>`;
    return;
  }

  const usersMap = new Map((STATE.users || []).map((user) => [user.id, user]));
  DOM.partnerDirectoryBody.innerHTML = STATE.partnerProfiles
    .map((partner) => {
      const url = partner.calculator_url || buildPartnerCalculatorUrl(partner.slug);
      const owner = usersMap.get(partner.owner_user_id);
      const ownerLabel = owner?.display_name || owner?.email || "—";
      return `
        <tr>
          <td>${escapeHtml(partner.display_name)}</td>
          <td>${escapeHtml(partner.slug)}</td>
          <td>${escapeHtml(partner.email || "—")}</td>
          <td>${escapeHtml(ownerLabel)}</td>
          <td><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></td>
        </tr>
      `;
    })
    .join("");
}

async function loadAdminData() {
  if (!isAdmin() || !STATE.schemaReady) {
    DOM.adminUsersBody.innerHTML = `<tr><td colspan="7" class="text-muted">Админ-функции доступны после запуска схемы платформы и входа админа.</td></tr>`;
    DOM.partnerDirectoryBody.innerHTML = `<tr><td colspan="5" class="text-muted">Сначала выполните platform_setup.sql.</td></tr>`;
    return;
  }

  const [{ data: users, error: userError }, { data: partners, error: partnerError }] = await Promise.all([
    supabase.from("app_profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("partner_profiles").select("*").order("display_name", { ascending: true })
  ]);

  if (userError) throw userError;
  if (partnerError) throw partnerError;

  STATE.users = users || [];
  STATE.partnerProfiles = partners || [];
  renderUserTable();
  renderPartnerDirectory();
}

async function saveUserProfile(userId) {
  const row = DOM.adminUsersBody.querySelector(`[data-user-id="${userId}"]`);
  if (!row) return;

  const payload = {
    display_name: row.querySelector('[name="display_name"]').value.trim(),
    role: row.querySelector('[name="role"]').value,
    partner_slug: sanitizeSlug(row.querySelector('[name="partner_slug"]').value),
    allowed_modules: row
      .querySelector('[name="allowed_modules"]')
      .value.split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    is_active: row.querySelector('[name="is_active"]').checked
  };

  const { error } = await supabase.from("app_profiles").update(payload).eq("id", userId);
  if (error) throw error;
  setAuthStatus("Изменения пользователя сохранены.", "success");
  await loadAdminData();
}

async function createPartner(form) {
  const formData = new FormData(form);
  const displayName = String(formData.get("displayName") || "").trim();
  const slug = sanitizeSlug(formData.get("slug"));
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const notes = String(formData.get("notes") || "").trim();

  if (!displayName || !slug) {
    throw new Error("Укажите имя и slug партнера.");
  }

  let ownerUserId = null;
  let ownerModules = null;
  if (email) {
    const { data: owner, error: ownerError } = await supabase
      .from("app_profiles")
      .select("id, allowed_modules")
      .eq("email", email)
      .maybeSingle();

    if (ownerError && ownerError.code !== "PGRST116") throw ownerError;
    ownerUserId = owner?.id || null;
    ownerModules = Array.isArray(owner?.allowed_modules) ? owner.allowed_modules : null;
  }

  const payload = {
    display_name: displayName,
    slug,
    email: email || null,
    owner_user_id: ownerUserId,
    notes: notes || null,
    calculator_url: buildPartnerCalculatorUrl(slug)
  };

  const { error } = await supabase.from("partner_profiles").upsert(payload, { onConflict: "slug" });
  if (error) throw error;

  if (ownerUserId) {
    const nextModules = Array.from(
      new Set([
        ...(ownerModules || ["dashboard", "sales", "my_calculator", "partner_calculator", "messenger"]),
        "light2"
      ])
    );
    await supabase
      .from("app_profiles")
      .update({ partner_slug: slug, allowed_modules: nextModules })
      .eq("id", ownerUserId);
  }

  form.reset();
  await loadAdminData();
}

function renderThreadList() {
  if (!STATE.threads.length) {
    DOM.threadList.innerHTML = `<div class="compact-help">Пока нет ни одного чата. Создайте первый.</div>`;
    return;
  }

  DOM.threadList.innerHTML = STATE.threads
    .map((thread) => `
      <button class="thread-item ${STATE.activeThreadId === thread.id ? "active" : ""}" type="button" data-open-thread="${escapeHtml(thread.id)}">
        <div class="fw-bold">${escapeHtml(thread.title || (thread.thread_type === "direct" ? "Личный чат" : "Группа"))}</div>
        <small>${escapeHtml(thread.thread_type)} • ${escapeHtml(formatDateTime(thread.created_at))}</small>
      </button>
    `)
    .join("");
}

async function loadThreads() {
  if (!STATE.schemaReady) {
    DOM.threadList.innerHTML = `<div class="compact-help">Мессенджер станет доступен после запуска platform_setup.sql.</div>`;
    DOM.messagesList.innerHTML = `<div class="compact-help">Таблицы мессенджера еще не созданы.</div>`;
    return;
  }

  const { data, error } = await supabase
    .from("app_thread_members")
    .select("thread_id, app_threads(id, title, thread_type, created_at)")
    .eq("user_id", STATE.user.id);

  if (error) throw error;

  STATE.threads = (data || [])
    .map((row) => row.app_threads)
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  renderThreadList();

  if (STATE.activeThreadId && STATE.threads.some((thread) => thread.id === STATE.activeThreadId)) {
    await loadMessages(STATE.activeThreadId);
  } else if (STATE.threads[0]) {
    await loadMessages(STATE.threads[0].id);
  } else {
    STATE.activeThreadId = null;
    DOM.messageThreadTitle.textContent = "Выберите чат";
    DOM.messageThreadMeta.textContent = "После создания новый чат появится слева.";
    DOM.messagesList.innerHTML = `<div class="compact-help">Пока чат не выбран.</div>`;
  }
}

async function loadMessages(threadId) {
  const thread = STATE.threads.find((item) => item.id === threadId);
  if (!thread) return;

  STATE.activeThreadId = threadId;
  renderThreadList();

  DOM.messageThreadTitle.textContent = thread.title || (thread.thread_type === "direct" ? "Личный чат" : "Группа");
  DOM.messageThreadMeta.textContent = `Тип: ${thread.thread_type} • создан ${formatDateTime(thread.created_at)}`;

  const { data: messages, error } = await supabase
    .from("app_messages")
    .select("id, thread_id, sender_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const senderIds = [...new Set((messages || []).map((message) => message.sender_id))];
  let profilesMap = new Map();

  if (senderIds.length) {
    const { data: profiles } = await supabase
      .from("app_profiles")
      .select("id, display_name, email")
      .in("id", senderIds);

    profilesMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
  }

  DOM.messagesList.innerHTML = (messages || [])
    .map((message) => {
      const profile = profilesMap.get(message.sender_id);
      const senderLabel = profile?.display_name || profile?.email || message.sender_id.slice(0, 8);
      const own = message.sender_id === STATE.user.id;
      return `
        <div class="message-bubble ${own ? "mine" : ""}">
          <div class="message-meta">${escapeHtml(senderLabel)} • ${escapeHtml(formatDateTime(message.created_at))}</div>
          <div>${escapeHtml(message.body)}</div>
        </div>
      `;
    })
    .join("") || `<div class="compact-help">В этом чате пока нет сообщений.</div>`;

  DOM.messagesList.scrollTop = DOM.messagesList.scrollHeight;
}

async function createThread(form) {
  if (!STATE.schemaReady) {
    throw new Error("Сначала нужно выполнить platform_setup.sql в Supabase.");
  }

  const formData = new FormData(form);
  const threadType = String(formData.get("threadType") || "direct");
  const titleInput = String(formData.get("title") || "").trim();
  const emails = String(formData.get("emails") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const uniqueEmails = [...new Set(emails)];
  let memberProfiles = [];

  if (uniqueEmails.length) {
    const { data, error } = await supabase
      .from("app_profiles")
      .select("id, email, display_name")
      .in("email", uniqueEmails);

    if (error) throw error;
    memberProfiles = data || [];
  }

  const memberIds = [...new Set(memberProfiles.map((profile) => profile.id).filter((id) => id && id !== STATE.user.id))];
  if (!memberIds.length) {
    throw new Error("Укажите хотя бы одного существующего участника по почте.");
  }

  const threadTitle =
    titleInput ||
    (threadType === "direct"
      ? memberProfiles[0]?.display_name || memberProfiles[0]?.email || "Личный чат"
      : `Группа ${new Date().toLocaleDateString("ru-RU")}`);

  const { data: thread, error: threadError } = await supabase
    .from("app_threads")
    .insert({
      thread_type: threadType,
      title: threadTitle,
      created_by: STATE.user.id
    })
    .select("*")
    .single();

  if (threadError) throw threadError;

  const memberships = [
    { thread_id: thread.id, user_id: STATE.user.id, member_role: "owner" },
    ...memberIds.map((userId) => ({ thread_id: thread.id, user_id: userId, member_role: "member" }))
  ];

  const { error: memberError } = await supabase.from("app_thread_members").insert(memberships);
  if (memberError) throw memberError;

  form.reset();
  await loadThreads();
  await loadMessages(thread.id);
}

async function sendMessage(form) {
  if (!STATE.activeThreadId) {
    throw new Error("Сначала выберите чат.");
  }

  const formData = new FormData(form);
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const { error } = await supabase.from("app_messages").insert({
    thread_id: STATE.activeThreadId,
    sender_id: STATE.user.id,
    body
  });

  if (error) throw error;
  form.reset();
  await loadMessages(STATE.activeThreadId);
}

async function refreshCurrentView() {
  if (STATE.activeModule === "admin") {
    await loadAdminData();
    return;
  }
  if (STATE.activeModule === "messenger") {
    await loadThreads();
    return;
  }
  if (STATE.activeModule === "dashboard") {
    renderDashboard();
    return;
  }
  if (MODULES[STATE.activeModule]?.type === "embed") {
    DOM.moduleFrame.src = DOM.moduleFrame.src;
  }
}

function bindAuthEvents() {
  DOM.authTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-pane]");
    if (!button) return;
    showAuthPane(button.dataset.authPane);
  });

  document.querySelectorAll("[data-auth-pane-trigger]").forEach((button) => {
    button.addEventListener("click", () => showAuthPane(button.dataset.authPaneTrigger));
  });

  document.getElementById("signInForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Проверяю логин и пароль...");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "")
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Вход выполнен.", "success");
  });

  document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Создаю учетную запись...");
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
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Аккаунт создан. Проверьте почту для подтверждения и входа.", "success");
  });

  document.getElementById("otpRequestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    setAuthStatus("Отправляю код на почту...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: REDIRECT_URL }
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    const verifyEmailField = document.querySelector('#otpVerifyForm [name="email"]');
    if (verifyEmailField) verifyEmailField.value = email;
    setAuthStatus("Код отправлен. Введите его в нижнюю форму.", "success");
  });

  document.getElementById("otpVerifyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Подтверждаю код...");
    const { error } = await supabase.auth.verifyOtp({
      email: String(formData.get("email") || "").trim(),
      token: String(formData.get("token") || "").trim(),
      type: "email"
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Код подтвержден. Вход выполнен.", "success");
  });

  document.getElementById("resetRequestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Отправляю письмо для восстановления...");
    const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get("email") || "").trim(), {
      redirectTo: REDIRECT_URL
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Письмо для восстановления отправлено.", "success");
  });

  document.getElementById("updatePasswordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Сохраняю новый пароль...");
    const { error } = await supabase.auth.updateUser({
      password: String(formData.get("password") || "")
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Новый пароль сохранен. Теперь можно войти.", "success");
  });
}

function bindAppEvents() {
  DOM.moduleNav.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-module-key]");
    if (!button) return;
    await openModule(button.dataset.moduleKey);
  });

  DOM.dashboardGrid.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-dashboard-open]");
    if (!button) return;
    await openModule(button.dataset.dashboardOpen);
  });

  document.getElementById("signOutButton").addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  document.getElementById("refreshButton").addEventListener("click", async () => {
    await refreshCurrentView();
  });

  document.getElementById("reloadUsersButton").addEventListener("click", async () => {
    await loadAdminData();
  });

  document.getElementById("reloadThreadsButton").addEventListener("click", async () => {
    await loadThreads();
  });

  DOM.adminUsersBody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-save-user]");
    if (!button) return;
    try {
      await saveUserProfile(button.dataset.saveUser);
    } catch (error) {
      setAuthStatus(error.message || "Не удалось сохранить пользователя.", "error");
    }
  });

  document.getElementById("partnerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createPartner(event.currentTarget);
      setAuthStatus("Партнер сохранен.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось сохранить партнера.", "error");
    }
  });

  document.getElementById("threadCreateForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createThread(event.currentTarget);
      setAuthStatus("Чат создан.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось создать чат.", "error");
    }
  });

  DOM.threadList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-open-thread]");
    if (!button) return;
    try {
      await loadMessages(button.dataset.openThread);
    } catch (error) {
      setAuthStatus(error.message || "Не удалось открыть чат.", "error");
    }
  });

  document.getElementById("messageForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await sendMessage(event.currentTarget);
      setAuthStatus("Сообщение отправлено.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось отправить сообщение.", "error");
    }
  });
}

async function init() {
  bindAuthEvents();
  bindAppEvents();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      showAuthScreen();
      showAuthPane("reset");
      setAuthStatus("Можно задать новый пароль.", "success");
      return;
    }

    if (event === "SIGNED_OUT") {
      STATE.session = null;
      STATE.user = null;
      STATE.profile = null;
      STATE.threads = [];
      STATE.partnerProfiles = [];
      showAuthScreen();
      setAuthStatus("Вы вышли из системы.");
      return;
    }

    if (session) {
      try {
        await bootstrapApp(session);
      } catch (error) {
        showAuthScreen();
        setAuthStatus(error.message || "Не удалось открыть платформу.", "error");
      }
    }
  });

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setAuthStatus(error.message || "Не удалось прочитать сессию.", "error");
    return;
  }

  if (data.session) {
    try {
      await bootstrapApp(data.session);
    } catch (sessionError) {
      setAuthStatus(sessionError.message || "Не удалось загрузить платформу.", "error");
    }
  } else {
    showAuthScreen();
  }
}

init().catch((error) => {
  console.error(error);
  showAuthScreen();
  setAuthStatus(error.message || "Платформа не смогла запуститься.", "error");
});
