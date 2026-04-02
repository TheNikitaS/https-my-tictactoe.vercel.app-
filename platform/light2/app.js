import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const DOM = {
  userDisplay: document.getElementById("userDisplay"),
  accessMode: document.getElementById("accessMode"),
  moduleState: document.getElementById("moduleState"),
  statusBox: document.getElementById("statusBox"),
  sectionTabs: document.getElementById("sectionTabs"),
  overviewGrid: document.getElementById("overviewGrid"),
  scopeNote: document.getElementById("scopeNote"),
  settlementForm: document.getElementById("settlementForm"),
  settlementPreview: document.getElementById("settlementPreview"),
  settlementSubmitButton: document.getElementById("settlementSubmitButton"),
  settlementResetButton: document.getElementById("settlementResetButton"),
  settlementPartnerFilter: document.getElementById("settlementPartnerFilter"),
  settlementStatusFilter: document.getElementById("settlementStatusFilter"),
  settlementSearch: document.getElementById("settlementSearch"),
  settlementSummary: document.getElementById("settlementSummary"),
  settlementTableBody: document.getElementById("settlementTableBody"),
  settlementActionsHead: document.getElementById("settlementActionsHead"),
  refreshSettlementsButton: document.getElementById("refreshSettlementsButton")
};

const SECTION_META = {
  overview: {
    title: "Обзор",
    subtitle: "Быстрый вход в перенесенные блоки ЛАЙТ 2."
  },
  balance: {
    title: "Баланс",
    subtitle: "Два контура из исходного листа: наличные / карта и счет ООО.",
    cards: [
      {
        title: "Наличные / карта",
        text: "Быстрый перенос с теми же сущностями, что и в Excel.",
        items: ["Дата", "Приход", "Расход", "Баланс", "Комментарий"]
      },
      {
        title: "Счёт ООО",
        text: "Второй контур учета с отдельным потоком операций.",
        items: ["Дата", "Приход", "Расход", "Баланс"]
      }
    ]
  },
  calendar: {
    title: "Платежный календарь",
    subtitle: "Платежи, контрагенты, статьи, счета и статусы распределения.",
    cards: [
      {
        title: "Поля листа",
        text: "Структура уже зафиксирована для следующего этапа миграции.",
        items: ["Дата платежа", "Контрагент", "Сумма", "Тип операции", "Статья", "Счет", "Статус", "Комментарий"]
      }
    ]
  },
  assets: {
    title: "Активы",
    subtitle: "Активы, стоимость, выплаты и текстовые комментарии.",
    cards: [
      {
        title: "Поля листа",
        text: "Подготовлено место для активов и последующих выплат.",
        items: ["Актив", "Стоимость", "Выплачено", "Комментарий"]
      }
    ]
  },
  settlements: {
    title: "Взаиморасчеты",
    subtitle: "Первый полностью рабочий раздел переноса из ЛАЙТ 2.",
    cards: [
      {
        title: "Поля исходного листа",
        text: "Блок вынесен в отдельную таблицу Supabase с доступом по партнеру.",
        items: ["Период", "Имя мастера / партнера", "ЗП мастера", "Покупки мастера", "Итог взаиморасчета", "Кто кому должен", "Статус"]
      }
    ]
  },
  purchases: {
    title: "Закупки",
    subtitle: "Будет вынесен следующим слоем после стабилизации взаиморасчетов.",
    cards: [
      {
        title: "План переноса",
        text: "Сначала переносим структуру закупок, затем связываем ее со складом и оплатами.",
        items: ["Поставщик", "Сумма", "Дата", "Комментарий", "Привязка к финансам"]
      }
    ]
  },
  leadgen: {
    title: "Лидогенерация",
    subtitle: "Сводка по рекламе, площадкам, директу и посадочным страницам.",
    cards: [
      {
        title: "Директ / фразы",
        text: "В исходнике есть отдельный лист со страницами и ключевыми фразами.",
        items: ["РСЯ", "Поиск", "Страница", "Фраза"]
      },
      {
        title: "Расходы и эффективность",
        text: "Отдельно зафиксированы расходы, показы и цена показа.",
        items: ["Расходы", "Показы", "Цена показа", "Месяц", "Изменение", "Процент"]
      }
    ]
  },
  metrics: {
    title: "Метрики",
    subtitle: "Месячные блоки по выручке, себестоимости и процентной динамике.",
    cards: [
      {
        title: "Финансовые статьи",
        text: "Таблица уже размечена под перенос в нормальную аналитику.",
        items: ["Статья", "Сумма", "Деньги", "Процент", "Месяц", "Изменения"]
      }
    ]
  },
  finance: {
    title: "Финмодель",
    subtitle: "Годовая рамка и ключевые показатели по месяцам.",
    cards: [
      {
        title: "Каркас листа",
        text: "Подготовлено место под верхнеуровневую финмодель.",
        items: ["Статья", "Месяц", "Сумма", "По дате", "Год"]
      }
    ]
  }
};

const STATE = {
  session: null,
  user: null,
  profile: null,
  partnerProfiles: [],
  settlements: [],
  activeSection: "overview",
  schemaReady: true,
  schemaError: "",
  editingSettlementId: null
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toNumber(value) {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(toNumber(value));
}

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function isAdmin() {
  return STATE.profile?.role === "owner" || STATE.profile?.role === "admin";
}

function isSchemaMissing(error) {
  const message = (error?.message || "").toLowerCase();
  return error?.code === "42P01" || message.includes("light2_partner_settlements");
}

function getCurrentPartnerSlug() {
  if (STATE.profile?.partner_slug) return STATE.profile.partner_slug;
  const linkedPartner = STATE.partnerProfiles.find((partner) => partner.owner_user_id === STATE.user?.id);
  return linkedPartner?.slug || "";
}

function getPartnerLabel(slug) {
  const cleanSlug = sanitizeSlug(slug);
  const partner = STATE.partnerProfiles.find((item) => item.slug === cleanSlug);
  return partner?.display_name || cleanSlug || "—";
}

function computeSettlement(entry) {
  const salary = toNumber(entry?.salary_amount);
  const purchase = toNumber(entry?.purchase_amount);
  const total = Math.round((salary - purchase) * 100) / 100;
  let direction = "Баланс закрыт";

  if (entry?.status === "Взаиморасчет произведен") {
    direction = "Взаиморасчёт закрыт";
  } else if (total > 0) {
    direction = "Компания должна партнеру";
  } else if (total < 0) {
    direction = "Партнер должен компании";
  }

  return { salary, purchase, total, direction };
}

function getStatusTone(status) {
  if (status === "К выплате") return "status-ready";
  if (status === "Взаиморасчет произведен") return "status-closed";
  if (status === "Спор") return "status-dispute";
  if (status === "Архив") return "status-archive";
  return "status-open";
}

function setStatus(message, tone = "") {
  DOM.statusBox.textContent = message;
  DOM.statusBox.className = `status-card${tone ? ` ${tone}` : ""}`;
}

function setModuleState(label) {
  DOM.moduleState.textContent = label;
}

function updateHero() {
  const displayName =
    STATE.profile?.display_name ||
    STATE.profile?.full_name ||
    STATE.user?.user_metadata?.display_name ||
    STATE.user?.email ||
    "Не определен";

  DOM.userDisplay.textContent = displayName;

  if (isAdmin()) {
    DOM.accessMode.textContent = "Владелец / админ";
    return;
  }

  const partnerSlug = getCurrentPartnerSlug();
  DOM.accessMode.textContent = partnerSlug ? `Партнер: ${getPartnerLabel(partnerSlug)}` : "Ограниченный доступ";
}

function renderOverview() {
  const cards = Object.entries(SECTION_META)
    .filter(([key]) => key !== "overview")
    .map(([key, meta]) => `
      <article class="overview-card">
        <h3>${escapeHtml(meta.title)}</h3>
        <p>${escapeHtml(meta.subtitle)}</p>
        <button class="btn btn-dark btn-sm" type="button" data-open-section="${escapeHtml(key)}">Открыть</button>
      </article>
    `)
    .join("");

  DOM.overviewGrid.innerHTML = cards;
}

function renderTemplateSections() {
  document.querySelectorAll(".template-host").forEach((host) => {
    const key = host.dataset.template;
    const meta = SECTION_META[key];
    if (!meta) return;

    host.innerHTML = `
      <div class="template-grid">
        ${meta.cards
          .map(
            (card) => `
              <article class="template-card">
                <h3>${escapeHtml(card.title)}</h3>
                <p>${escapeHtml(card.text)}</p>
                <ul>
                  ${card.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  });
}

function openSection(sectionKey) {
  STATE.activeSection = sectionKey;
  document.querySelectorAll(".section-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionKey);
  });
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("d-none", section.id !== `section-${sectionKey}`);
  });
}

function renderPartnerSelect(select, options = {}) {
  const includeAll = options.includeAll ?? false;
  const currentPartnerSlug = getCurrentPartnerSlug();
  const isPartnerMode = !isAdmin();

  let rows = STATE.partnerProfiles.slice().sort((a, b) => a.display_name.localeCompare(b.display_name, "ru"));
  if (isPartnerMode && currentPartnerSlug) {
    rows = rows.filter((item) => item.slug === currentPartnerSlug);
  }

  const items = [];
  if (includeAll) {
    items.push(`<option value="">Все партнеры</option>`);
  }
  rows.forEach((partner) => {
    items.push(`<option value="${escapeHtml(partner.slug)}">${escapeHtml(partner.display_name)}</option>`);
  });

  select.innerHTML = items.join("");

  if (isPartnerMode) {
    select.value = currentPartnerSlug || "";
    select.disabled = true;
  }
}

function updateSettlementPreview() {
  const formData = new FormData(DOM.settlementForm);
  const draft = {
    salary_amount: formData.get("salary_amount"),
    purchase_amount: formData.get("purchase_amount"),
    status: formData.get("status")
  };
  const math = computeSettlement(draft);

  DOM.settlementPreview.innerHTML = `
    <span>Итог взаиморасчета</span>
    <strong>${formatMoney(math.total)} ₽</strong>
    <span>${escapeHtml(math.direction)}</span>
  `;
}

function resetSettlementForm() {
  STATE.editingSettlementId = null;
  DOM.settlementForm.reset();
  DOM.settlementForm.elements.status.value = "Ожидает сверки";
  DOM.settlementSubmitButton.textContent = "Сохранить запись";

  if (!isAdmin()) {
    DOM.settlementForm.classList.add("is-hidden");
  } else {
    DOM.settlementForm.classList.remove("is-hidden");
    renderPartnerSelect(DOM.settlementForm.elements.partner_slug);
  }

  updateSettlementPreview();
}

function renderScopeNote() {
  if (!STATE.schemaReady) {
    DOM.scopeNote.textContent = "Для блока взаиморасчетов нужно один раз выполнить SQL-патч platform_light2_patch.sql.";
    return;
  }

  if (isAdmin()) {
    DOM.scopeNote.textContent = "Вы видите все взаиморасчеты и можете управлять ими из одного места.";
    return;
  }

  const partnerSlug = getCurrentPartnerSlug();
  if (!partnerSlug) {
    DOM.scopeNote.textContent = "Партнер еще не привязан к вашему профилю. После привязки тут появятся только ваши взаиморасчеты.";
    return;
  }

  DOM.scopeNote.textContent = `Вы видите только свой контур взаиморасчетов: ${getPartnerLabel(partnerSlug)}.`;
}

function getVisibleSettlements() {
  const filterPartner = sanitizeSlug(DOM.settlementPartnerFilter.value);
  const filterStatus = DOM.settlementStatusFilter.value;
  const query = String(DOM.settlementSearch.value || "").trim().toLowerCase();
  const currentPartnerSlug = getCurrentPartnerSlug();

  let rows = STATE.settlements.slice();

  if (!isAdmin()) {
    rows = rows.filter((item) => sanitizeSlug(item.partner_slug) === currentPartnerSlug);
  } else if (filterPartner) {
    rows = rows.filter((item) => sanitizeSlug(item.partner_slug) === filterPartner);
  }

  if (filterStatus) {
    rows = rows.filter((item) => item.status === filterStatus);
  }

  if (query) {
    rows = rows.filter((item) => {
      const math = computeSettlement(item);
      const haystack = [
        item.period_label,
        getPartnerLabel(item.partner_slug),
        item.status,
        item.note,
        math.direction
      ]
        .join(" | ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  rows.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
  return rows;
}

function renderSettlementSummary(rows) {
  const pending = rows.filter((item) => item.status !== "Взаиморасчет произведен" && item.status !== "Архив");
  const total = rows.reduce((sum, item) => sum + computeSettlement(item).total, 0);
  const payout = pending.reduce((sum, item) => {
    const math = computeSettlement(item);
    return math.total > 0 ? sum + math.total : sum;
  }, 0);

  DOM.settlementSummary.innerHTML = `
    <article class="summary-card">
      <span>Строк в выборке</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>Открытых строк</span>
      <strong>${pending.length}</strong>
    </article>
    <article class="summary-card">
      <span>Чистый итог</span>
      <strong>${formatMoney(total)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>К выплате партнерам</span>
      <strong>${formatMoney(payout)} ₽</strong>
    </article>
  `;
}

function renderSettlements() {
  DOM.settlementActionsHead.textContent = isAdmin() ? "Действия" : "";
  renderScopeNote();

  if (!STATE.schemaReady) {
    DOM.settlementTableBody.innerHTML = `<tr><td colspan="10" class="muted">Сначала выполните platform_light2_patch.sql в Supabase SQL Editor.</td></tr>`;
    DOM.settlementSummary.innerHTML = "";
    return;
  }

  const rows = getVisibleSettlements();
  renderSettlementSummary(rows);

  if (!rows.length) {
    DOM.settlementTableBody.innerHTML = `<tr><td colspan="10" class="muted">Пока нет записей для текущего фильтра.</td></tr>`;
    return;
  }

  DOM.settlementTableBody.innerHTML = rows
    .map((item) => {
      const math = computeSettlement(item);
      const canEdit = isAdmin();
      return `
        <tr>
          <td>${escapeHtml(item.period_label)}</td>
          <td>${escapeHtml(getPartnerLabel(item.partner_slug))}</td>
          <td class="text-end">${escapeHtml(formatMoney(math.salary))}</td>
          <td class="text-end">${escapeHtml(formatMoney(math.purchase))}</td>
          <td class="text-end">${escapeHtml(formatMoney(math.total))}</td>
          <td>${escapeHtml(math.direction)}</td>
          <td><span class="badge-soft ${getStatusTone(item.status)}">${escapeHtml(item.status)}</span></td>
          <td>${escapeHtml(item.note || "—")}</td>
          <td class="small">${escapeHtml(formatDateTime(item.updated_at || item.created_at))}</td>
          <td>
            ${
              canEdit
                ? `
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-dark btn-sm" type="button" data-edit-settlement="${escapeHtml(item.id)}">Изменить</button>
                    <button class="btn btn-outline-danger btn-sm" type="button" data-delete-settlement="${escapeHtml(item.id)}">Удалить</button>
                  </div>
                `
                : `<span class="muted">—</span>`
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function fillSettlementForm(item) {
  STATE.editingSettlementId = item.id;
  DOM.settlementForm.elements.period_label.value = item.period_label || "";
  DOM.settlementForm.elements.partner_slug.value = item.partner_slug || "";
  DOM.settlementForm.elements.salary_amount.value = toNumber(item.salary_amount);
  DOM.settlementForm.elements.purchase_amount.value = toNumber(item.purchase_amount);
  DOM.settlementForm.elements.status.value = item.status || "Ожидает сверки";
  DOM.settlementForm.elements.note.value = item.note || "";
  DOM.settlementSubmitButton.textContent = "Сохранить изменения";
  updateSettlementPreview();
}

async function loadBootstrapData() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (!sessionData.session) {
    STATE.session = null;
    STATE.user = null;
    STATE.profile = null;
    setModuleState("Нужен вход");
    setStatus("Откройте модуль через платформу после входа в аккаунт.", "warning");
    DOM.userDisplay.textContent = "Нет сессии";
    DOM.accessMode.textContent = "—";
    return false;
  }

  STATE.session = sessionData.session;
  STATE.user = sessionData.session.user;

  const [{ data: profile, error: profileError }, { data: partners, error: partnersError }] = await Promise.all([
    supabase.from("app_profiles").select("*").eq("id", STATE.user.id).maybeSingle(),
    supabase.from("partner_profiles").select("*").order("display_name", { ascending: true })
  ]);

  if (profileError && profileError.code !== "PGRST116") throw profileError;
  if (partnersError) throw partnersError;

  STATE.profile = profile || null;
  STATE.partnerProfiles = partners || [];
  updateHero();

  renderPartnerSelect(DOM.settlementPartnerFilter, { includeAll: true });
  renderPartnerSelect(DOM.settlementForm.elements.partner_slug);
  resetSettlementForm();
  return true;
}

async function loadSettlements() {
  const { data, error } = await supabase
    .from("light2_partner_settlements")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isSchemaMissing(error)) {
      STATE.schemaReady = false;
      STATE.schemaError = error.message || "Таблица light2_partner_settlements не найдена.";
      setModuleState("Нужен SQL-патч");
      setStatus("Чтобы включить рабочий блок взаиморасчетов, выполните platform_light2_patch.sql в Supabase SQL Editor.", "warning");
      renderSettlements();
      return;
    }
    throw error;
  }

  STATE.schemaReady = true;
  STATE.schemaError = "";
  STATE.settlements = data || [];
  setModuleState("Готово");
  setStatus("ЛАЙТ 2 загружен. Взаиморасчеты уже работают внутри платформы.", "success");
  renderSettlements();
}

async function saveSettlement() {
  const formData = new FormData(DOM.settlementForm);
  const payload = {
    partner_slug: sanitizeSlug(formData.get("partner_slug")),
    period_label: String(formData.get("period_label") || "").trim(),
    salary_amount: toNumber(formData.get("salary_amount")),
    purchase_amount: toNumber(formData.get("purchase_amount")),
    status: String(formData.get("status") || "Ожидает сверки"),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.partner_slug || !payload.period_label) {
    throw new Error("Укажите период и партнера.");
  }

  if (STATE.editingSettlementId) {
    const { error } = await supabase
      .from("light2_partner_settlements")
      .update(payload)
      .eq("id", STATE.editingSettlementId);
    if (error) throw error;
    setStatus("Запись взаиморасчета обновлена.", "success");
  } else {
    const { error } = await supabase.from("light2_partner_settlements").insert(payload);
    if (error) throw error;
    setStatus("Запись взаиморасчета добавлена.", "success");
  }

  resetSettlementForm();
  await loadSettlements();
}

async function deleteSettlement(id) {
  const { error } = await supabase.from("light2_partner_settlements").delete().eq("id", id);
  if (error) throw error;
  setStatus("Запись взаиморасчета удалена.", "success");
  await loadSettlements();
}

function bindEvents() {
  DOM.sectionTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (!button) return;
    openSection(button.dataset.section);
  });

  DOM.overviewGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-section]");
    if (!button) return;
    openSection(button.dataset.openSection);
  });

  DOM.settlementForm.addEventListener("input", updateSettlementPreview);
  DOM.settlementForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveSettlement();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить запись взаиморасчета.", "error");
    }
  });

  DOM.settlementResetButton.addEventListener("click", () => {
    resetSettlementForm();
    renderSettlements();
  });

  [DOM.settlementPartnerFilter, DOM.settlementStatusFilter, DOM.settlementSearch].forEach((element) => {
    element.addEventListener("input", renderSettlements);
    element.addEventListener("change", renderSettlements);
  });

  DOM.refreshSettlementsButton.addEventListener("click", async () => {
    try {
      await loadSettlements();
    } catch (error) {
      setStatus(error.message || "Не удалось обновить взаиморасчеты.", "error");
    }
  });

  DOM.settlementTableBody.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-settlement]");
    if (editButton) {
      const item = STATE.settlements.find((row) => row.id === editButton.dataset.editSettlement);
      if (item) {
        fillSettlementForm(item);
        openSection("settlements");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-settlement]");
    if (!deleteButton) return;

    if (!window.confirm("Удалить запись взаиморасчета?")) return;
    try {
      await deleteSettlement(deleteButton.dataset.deleteSettlement);
    } catch (error) {
      setStatus(error.message || "Не удалось удалить запись.", "error");
    }
  });
}

async function start() {
  renderOverview();
  renderTemplateSections();
  bindEvents();
  openSection("overview");

  try {
    const ready = await loadBootstrapData();
    if (!ready) return;
    await loadSettlements();
  } catch (error) {
    setModuleState("Ошибка");
    setStatus(error.message || "Не удалось запустить модуль ЛАЙТ 2.", "error");
  }
}

start();
